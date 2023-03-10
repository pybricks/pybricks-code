// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import { compile as mpyCrossCompileV5 } from '@pybricks/mpy-cross-v5';
import { compile as mpyCrossCompileV6 } from '@pybricks/mpy-cross-v6';
import { call, getContext, put, select, takeEvery } from 'typed-redux-saga/macro';
import { editorGetValue } from '../editor/sagaLib';
import { FileContents, FileStorageDb } from '../fileStorage';
import { findImportedModules, resolveModule } from '../pybricksMicropython/lib';
import { RootState } from '../reducers';
import {
    compile,
    didCompile,
    didFailToCompile,
    mpyCompileMulti6,
    mpyDidCompileMulti6,
    mpyDidFailToCompileMulti6,
} from './actions';

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
 * This includes a __main__ module which is the file currently open in the
 * editor and any imported modules that can be found in the user file system.
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

    const mainPy = yield* editorGetValue();

    const pyFiles = new Map<string, FileContents>([
        ['__main__', { path: metadata.path ?? '__main__.py', contents: mainPy }],
    ]);

    const checkedModules = new Set<string>(['__main__']);
    const uncheckedScripts = new Array<string>(mainPy);

    for (;;) {
        // parse all unchecked scripts to find imported modules that haven't
        // been checked yet

        const uncheckedModules = new Set<string>();

        for (const uncheckedScript of uncheckedScripts) {
            const importedModules = findImportedModules(uncheckedScript);

            for (const m of importedModules) {
                if (!checkedModules.has(m)) {
                    uncheckedModules.add(m);
                }
            }
        }

        // all of the scripts have been checked now, so clear the unchecked list
        uncheckedScripts.length = 0;

        // when no more new modules are found, we are done
        if (uncheckedModules.size === 0) {
            break;
        }

        // try to resolve unchecked modules in the file system
        for (const m of uncheckedModules) {
            const file = yield* call(() => resolveModule(db, m));

            // if found, queue the module to be compiled and to be parsed
            // for additional imports
            if (file) {
                pyFiles.set(m, file);
                uncheckedScripts.push(file.contents);
            }

            checkedModules.add(m);
        }
    }

    const blobParts: BlobPart[] = [];

    for (const [m, py] of pyFiles) {
        const result = yield* call(() =>
            mpyCrossCompileV6(
                py.path,
                py.contents,
                undefined,
                new URL(
                    '@pybricks/mpy-cross-v6/build/mpy-cross-v6.wasm',
                    import.meta.url,
                ).toString(),
            ),
        );

        if (result.status !== 0 || !result.mpy) {
            yield* put(mpyDidFailToCompileMulti6(result.err));
            return;
        }

        // each file is encoded as the size, module name, and mpy binary
        blobParts.push(encodeUInt32LE(result.mpy.length));
        blobParts.push(cString(m));
        blobParts.push(result.mpy);
    }

    yield* put(mpyDidCompileMulti6(new Blob(blobParts)));
}

export default function* (): Generator {
    yield* takeEvery(compile, handleCompile);
    yield* takeEvery(mpyCompileMulti6, handleCompileMulti6);
}
