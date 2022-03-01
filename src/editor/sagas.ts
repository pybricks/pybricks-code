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
import {
    fileStorageDidFailToReadFile,
    fileStorageDidInitialize,
    fileStorageDidReadFile,
    fileStorageReadFile,
} from '../fileStorage/actions';
import { RootState } from '../reducers';
import { ensureError } from '../utils';
import {
    didFailToSaveAs,
    didSaveAs,
    didSetEditSession,
    open,
    saveAs,
    setEditSession,
} from './actions';

const decoder = new TextDecoder();

function* handleOpen(action: ReturnType<typeof open>): Generator {
    const editor = yield* select((s: RootState) => s.editor.current);

    // istanbul ignore next: it is a bug to dispatch this action with no current editor
    if (editor === null) {
        console.error('open: No current editor');
        return;
    }

    const text = decoder.decode(action.data);
    editor.setValue(text);
}

function* handleSaveAs(): Generator {
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

function* handleSetEditSession(action: ReturnType<typeof setEditSession>): Generator {
    if (action.editSession === undefined) {
        // REVISIT: this should probably do something, but currently we don't
        // expect this to happen
        yield* put(didSetEditSession(action.editSession));
        return;
    }

    // ensure storage has been initialized

    const isStorageInitialized = yield* select(
        (s: RootState) => s.fileStorage.isInitialized,
    );

    if (!isStorageInitialized) {
        yield* take(fileStorageDidInitialize);
    }

    // TODO: get current file from state
    const currentFileName = 'main.py';

    const fileList = yield* select((s: RootState) => s.fileStorage.fileNames);

    if (!fileList.includes(currentFileName)) {
        // The file doesn't exist in storage, so don't try to open it.
        yield* put(didSetEditSession(action.editSession));
        return;
    }

    // TODO: implement locking to ensure exclusive access to file

    yield* put(fileStorageReadFile(currentFileName));
    const { result } = yield* race({
        result: take(
            fileStorageDidReadFile.when((a) => a.fileName === currentFileName),
        ),
        error: take(
            fileStorageDidFailToReadFile.when((a) => a.fileName === currentFileName),
        ),
    });

    if (result) {
        action.editSession.setValue(result.fileContents);
    }

    yield* put(didSetEditSession(action.editSession));
}

export default function* (): Generator {
    yield* takeEvery(open, handleOpen);
    yield* takeEvery(saveAs, handleSaveAs);
    yield* takeLatest(setEditSession, handleSetEditSession);
}
