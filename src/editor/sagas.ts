// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { monaco } from 'react-monaco-editor';
import { eventChannel } from 'redux-saga';
import {
    SagaGenerator,
    fork,
    getContext,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import {
    fileStorageDidFailToOpenFile,
    fileStorageDidFailToReadFile,
    fileStorageDidInitialize,
    fileStorageDidOpenFile,
    fileStorageDidReadFile,
    fileStorageOpenFile,
    fileStorageReadFile,
} from '../fileStorage/actions';
import { RootState } from '../reducers';
import { defined } from '../utils';
import {
    editorDidCreate,
    editorGetValueRequest,
    editorGetValueResponse,
} from './actions';

/**
 * Saga that gets the current value from the editor.
 * @returns The value.
 * @throws Error if editor.isReady state is false.
 */
export function* editorGetValue(): SagaGenerator<string> {
    const nextMessageId = yield* getContext<() => number>('nextMessageId');

    const isReady = yield* select((s: RootState) => s.editor.isReady);

    if (!isReady) {
        throw new Error('editorGetValue() called before editor.isReady');
    }

    const request = yield* put(editorGetValueRequest(nextMessageId()));
    const response = yield* take(
        editorGetValueResponse.when((a) => a.id === request.id),
    );

    return response.value;
}

function* handleEditorGetValueRequest(
    editor: monaco.editor.ICodeEditor,
    action: ReturnType<typeof editorGetValueRequest>,
): Generator {
    yield* put(editorGetValueResponse(action.id, editor.getValue()));
}

function* handleDidCreateEditor(editor: monaco.editor.ICodeEditor): Generator {
    // first, we need to be sure that file storage is ready

    const isFileStorageInitialized = yield* select(
        (s: RootState) => s.fileStorage.isInitialized,
    );

    if (!isFileStorageInitialized) {
        yield* take(fileStorageDidInitialize);
    }

    // then we can load the most recently used file
    // REVISIT: should this be here or elsewhere?

    yield* put(fileStorageOpenFile('main.py'));

    const didOpen = yield* race({
        succeeded: take(fileStorageDidOpenFile.when((a) => a.path === 'main.py')),
        failed: take(fileStorageDidFailToOpenFile.when((a) => a.path === 'main.py')),
    });

    // TODO: what to do in case of failure?
    if (didOpen.succeeded) {
        defined(didOpen.succeeded);

        const { id } = didOpen.succeeded;

        yield* put(fileStorageReadFile(id));

        const didRead = yield* race({
            succeeded: take(fileStorageDidReadFile.when((a) => a.id === id)),
            failed: take(fileStorageDidFailToReadFile.when((a) => a.id === id)),
        });

        // TODO: what to do in case of failure?
        if (didRead.succeeded) {
            const { contents } = didRead.succeeded;
            editor.setValue(contents);
        }
    }

    yield* takeEvery(editorGetValueRequest, handleEditorGetValueRequest, editor);

    yield* put(editorDidCreate());
}

function* monitorEditors(): Generator {
    const ch = eventChannel<monaco.editor.ICodeEditor>((emit) => {
        const subscription = monaco.editor.onDidCreateEditor(emit);
        return () => subscription.dispose();
    });

    yield* takeEvery(ch, handleDidCreateEditor);
}

export default function* (): Generator {
    yield* fork(monitorEditors);
}
