// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { monaco } from 'react-monaco-editor';
import { eventChannel } from 'redux-saga';
import { fork, put, race, select, take, takeEvery } from 'typed-redux-saga/macro';
import {
    fileStorageDidFailToReadFile,
    fileStorageDidInitialize,
    fileStorageDidReadFile,
    fileStorageReadFile,
} from '../fileStorage/actions';
import { RootState } from '../reducers';

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

    yield* put(fileStorageReadFile('main.py'));

    const { succeeded } = yield* race({
        succeeded: take(fileStorageDidReadFile.when((a) => a.fileName === 'main.py')),
        failed: take(
            fileStorageDidFailToReadFile.when((a) => a.fileName === 'main.py'),
        ),
    });

    // TODO: what to do in case of failure?

    if (succeeded) {
        editor.setValue(succeeded.fileContents);
    }

    // TODO: subscribe to actions that act on the editor
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
