// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2026 The Pybricks Authors

import { compile as mpyCrossCompileV5 } from '@pybricks/mpy-cross-v5';
import { compile as mpyCrossCompileV6 } from '@pybricks/mpy-cross-v6';
import { call, getContext, put, select, takeEvery } from 'typed-redux-saga/macro';
import { editorGetValue } from '../editor/sagaLib';
import { FileContents, FileStorageDb } from '../fileStorage';
import { resolveModule } from '../pybricksMicropython/lib';
import { RootState } from '../reducers';
import {
    compile,
    didCompile,
    didFailToCompile,
    mpyCompileMulti6,
    mpyDidCompileMulti6,
    mpyDidFailToCompileMulti6,
} from './actions';
import { MpyFormatError, findImportedModules } from './mpyImports';

const encoder = new TextEncoder();

/**
 * Converts JavaScript string to C string.
 * @param str A string.
 * @returns Zero-terminated, UTF-8 encoded byte array.
 */
function cString(str: string): Uint8Array {
    return encoder.encode(str + '\x00');
}

/**
 * Encodes *value* as a 32-bit unsigned integer in little endian order.
 * @param value An integer between 0 and 2^32.
 * @returns A 4-byte array containing the encoded valued.
 */
function encodeUInt32LE(value: number): ArrayBuffer {
    const buf = new ArrayBuffer(4);
    const view = new DataView(buf);
    view.setUint32(0, value, true);
    return buf;
}

/**
 * Compiles a script to .mpy and dispatches either didCompile on success or
 * didFailToCompile on error.
 * @param action A mpy compile action.
 */
function* handleCompile(action: ReturnType<typeof compile>): Generator {
    switch (action.abiVersion) {
        case 5:
            {
                const result = yield* call(() =>
                    mpyCrossCompileV5(
                        'main.py',
                        action.script,
                        action.options,
                        new URL(
                            '@pybricks/mpy-cross-v5/build/mpy-cross.wasm',
                            import.meta.url,
                        ).toString(),
                    ),
                );
                if (result.status === 0 && result.mpy) {
                    yield* put(didCompile(result.mpy));
                } else {
                    yield* put(didFailToCompile(result.err));
                }
            }
            break;

        case 6:
            {
                const result = yield* call(() =>
                    mpyCrossCompileV6(
                        'main.py',
                        action.script,
                        action.options,
                        new URL(
                            '@pybricks/mpy-cross-v6/build/mpy-cross-v6.wasm',
                            import.meta.url,
                        ).toString(),
                    ),
                );
                if (result.status === 0 && result.mpy) {
                    yield* put(didCompile(result.mpy));
                } else {
                    yield* put(didFailToCompile(result.err));
                }
            }
            break;

        default:
            {
                yield* put(
                    didFailToCompile([
                        `unsupported MPY ABI version: ${action.abiVersion}`,
                    ]),
                );
            }
            break;
    }
}

/**
 * Compiles code into the Pybricks multi-mpy6 file format.
 *
 * This includes the file currently open in the editor and any imported modules
 * that can be found in the user file system.
 */
function* handleCompileMulti6(): Generator {
    // REVISIT: should we be getting the active file here or have it as an
    // action parameter?

    const fileUuid = yield* select((s: RootState) => s.editor.activeFileUuid);

    if (!fileUuid) {
        // TODO: error needs to be translated
        yield* put(mpyDidFailToCompileMulti6(['no active file']));
        return;
    }

    const db = yield* getContext<FileStorageDb>('fileStorage');
    const metadata = yield* call(() => db.metadata.get(fileUuid));

    if (!metadata) {
        // TODO: error needs to be translated
        yield* put(mpyDidFailToCompileMulti6(['file not found in database']));
        return;
    }

    const useLegacyMainModule = yield* select(
        (s: RootState) => s.hub.useLegacyMainModule,
    );

    const mainPyContents = yield* editorGetValue();
    const mainPyPath = metadata.path ?? '__main__.py';
    const mainPyName = useLegacyMainModule
        ? '__main__'
        : mainPyPath.replace(/\.[^.]+$/, '');

    // NB: the URL has to be created outside of the loop or webpack won't be able to
    // resolve it as an asset.
    const wasmUrl = new URL(
        '@pybricks/mpy-cross-v6/build/mpy-cross-v6.wasm',
        import.meta.url,
    ).toString();

    // Compile the main module, then read the modules it imports back out of the
    // compiled bytecode and do the same for each of those, until nothing new is found.
    // Each module is compiled exactly once and the order is preserved so that the main
    // module comes first in the downloaded program.

    const compiled = new Map<string, Uint8Array>();
    const checkedModules = new Set<string>([mainPyName]);
    const uncompiled = new Array<[string, FileContents]>([
        mainPyName,
        { path: mainPyPath, contents: mainPyContents },
    ]);

    for (;;) {
        const next = uncompiled.shift();

        if (!next) {
            break;
        }

        const [module, py] = next;

        const result = yield* call(() =>
            mpyCrossCompileV6(py.path, py.contents, undefined, wasmUrl),
        );

        if (result.status !== 0 || !result.mpy) {
            yield* put(mpyDidFailToCompileMulti6(result.err));
            return;
        }

        compiled.set(module, result.mpy);

        let importedModules: ReadonlySet<string>;

        try {
            importedModules = findImportedModules(result.mpy);
        } catch (err) {
            // This means mpy-cross is producing a file format we don't know how to
            // read, which would only happen if the mpy-cross dependency changed. Fail
            // loudly rather than silently downloading a program with missing modules.
            // TODO: error needs to be translated
            yield* put(
                mpyDidFailToCompileMulti6([
                    err instanceof MpyFormatError
                        ? `failed to read imports of '${py.path}': ${err.message}`
                        : String(err),
                ]),
            );
            return;
        }

        // try to resolve newly found modules in the file system
        for (const m of importedModules) {
            if (checkedModules.has(m)) {
                continue;
            }

            checkedModules.add(m);

            const file = yield* call(() => resolveModule(db, m));

            // if not found, the module is assumed to be built in to the firmware
            if (file) {
                uncompiled.push([m, file]);
            }
        }
    }

    const blobParts: BlobPart[] = [];

    for (const [module, mpy] of compiled) {
        // each file is encoded as the size, module name, and mpy binary
        blobParts.push(encodeUInt32LE(mpy.length));
        blobParts.push(cString(module));
        blobParts.push(mpy);
    }

    yield* put(mpyDidCompileMulti6(new Blob(blobParts)));
}

export default function* (): Generator {
    yield* takeEvery(compile, handleCompile);
    yield* takeEvery(mpyCompileMulti6, handleCompileMulti6);
}
