// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import FileSaver from 'file-saver';
import {
    call,
    put,
    race,
    select,
    take,
    takeEvery,
    takeLatest,
} from 'typed-redux-saga/macro';
import { Action } from '../actions';
import {
    FileStorageActionType,
    FileStorageDidFailToReadFileAction,
    FileStorageDidReadFileAction,
    fileStorageReadFile,
} from '../fileStorage/actions';
import { RootState } from '../reducers';
import { ensureError } from '../utils';
import {
    CurrentEditorAction,
    EditorActionType,
    EditorOpenAction,
    EditorSaveAsAction,
    didFailToSaveAs,
    didSaveAs,
} from './actions';

const decoder = new TextDecoder();

function* open(action: EditorOpenAction): Generator {
    const editor = yield* select((s: RootState) => s.editor.current);

    // istanbul ignore next: it is a bug to dispatch this action with no current editor
    if (editor === null) {
        console.error('open: No current editor');
        return;
    }

    const text = decoder.decode(action.data);
    editor.setValue(text);
}

function* saveAs(_action: EditorSaveAsAction): Generator {
    const editor = yield* select((s: RootState) => s.editor.current);

    // istanbul ignore next: it is a bug to dispatch this action with no current editor
    if (editor === null) {
        console.error('saveAs: No current editor');
        return;
    }

    const data = editor.getValue();
    const blob = new Blob([data], { type: 'text/x-python;charset=utf-8' });

    if (window.showSaveFilePicker) {
        // This uses https://wicg.github.io/file-system-access which is not
        // available in all browsers
        try {
            const handle = yield* call(() =>
                window.showSaveFilePicker({
                    suggestedName: 'main.py',
                    types: [
                        {
                            accept: { 'text/x-python': '.py' },
                            // TODO: translate description
                            description: 'Python Files',
                        },
                    ],
                }),
            );

            const writeable = yield* call(() => handle.createWritable());
            yield* call(() => writeable.write(blob));
            yield* call(() => writeable.close());
        } catch (err) {
            yield* put(didFailToSaveAs(ensureError(err)));
            return;
        }
    } else {
        // this is a fallback to use the standard browser download mechanism
        try {
            FileSaver.saveAs(blob, 'main.py');
        } catch (err) {
            yield* put(didFailToSaveAs(ensureError(err)));
            return;
        }
    }

    yield* put(didSaveAs());
}

function* handleEditSession(action: CurrentEditorAction): Generator {
    if (action.editSession === null) {
        // there is not current edit session, nothing to do
        return;
    }

    // ensure storage has been initialized

    const isStorageInitialized = yield* select(
        (s: RootState) => s.fileStorage.isInitialized,
    );

    if (!isStorageInitialized) {
        yield* take(FileStorageActionType.DidInitialize);
    }

    // TODO: get current file from state
    const currentFileName = 'main.py';

    // TODO: implement locking to ensure exclusive access to file

    yield* put(fileStorageReadFile(currentFileName));
    const { result } = yield* race({
        result: take<FileStorageDidReadFileAction>(
            (a: Action) =>
                a.type === FileStorageActionType.DidReadFile &&
                a.fileName === currentFileName,
        ),
        error: take<FileStorageDidFailToReadFileAction>(
            (a: Action) =>
                a.type === FileStorageActionType.DidFailToReadFile &&
                a.fileName === currentFileName,
        ),
    });

    if (result) {
        action.editSession?.setValue(result.fileContents);
    }
}

export default function* (): Generator {
    yield* takeEvery(EditorActionType.Open, open);
    yield* takeEvery(EditorActionType.SaveAs, saveAs);
    yield* takeLatest(EditorActionType.Current, handleEditSession);
}
