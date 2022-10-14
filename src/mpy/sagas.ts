// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { compile as mpyCrossCompileV5 } from '@pybricks/mpy-cross-v5';
import wasmV5 from '@pybricks/mpy-cross-v5/build/mpy-cross.wasm';
import { compile as mpyCrossCompileV6 } from '@pybricks/mpy-cross-v6';
import wasmV6 from '@pybricks/mpy-cross-v6/build/mpy-cross-v6.wasm';
import { call, getContext, put, select, takeEvery } from 'typed-redux-saga/macro';
import { editorGetValue } from '../editor/sagas';
import { FileStorageDb } from '../fileStorage';
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
                        // HACK: testing user agent for jsdom is needed only for getting unit tests to work
                        navigator.userAgent.includes('jsdom') ? undefined : wasmV5,
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
                        // HACK: testing user agent for jsdom is needed only for getting unit tests to work
                        navigator.userAgent.includes('jsdom') ? undefined : wasmV6,
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

    const script = yield* editorGetValue();

    const result = yield* call(() =>
        mpyCrossCompileV6(
            metadata.path ?? '__main__.py',
            script,
            undefined,
            // HACK: testing user agent for jsdom is needed only for getting unit tests to work
            navigator.userAgent.includes('jsdom') ? undefined : wasmV6,
        ),
    );

    // TODO: add support for imports and append to blob

    if (result.status === 0 && result.mpy) {
        const sizeBuf = new ArrayBuffer(4);
        const sizeView = new DataView(sizeBuf);
        sizeView.setUint32(0, result.mpy.length, true);

        const blob = new Blob([sizeBuf, encoder.encode('__main__\x00'), result.mpy]);

        yield* put(mpyDidCompileMulti6(blob));
    } else {
        yield* put(mpyDidFailToCompileMulti6(result.err));
    }
}

export default function* (): Generator {
    yield* takeEvery(compile, handleCompile);
    yield* takeEvery(mpyCompileMulti6, handleCompileMulti6);
}
