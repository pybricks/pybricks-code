// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import FileSaver from 'file-saver';
import JSZip from 'jszip';
import localForage from 'localforage';
import { extendPrototype } from 'localforage-observable';
import { eventChannel } from 'redux-saga';
import { call, fork, getContext, put, takeEvery } from 'typed-redux-saga/macro';
import Observable from 'zen-observable';
import { EditorType } from '../editor/Editor';
import { pythonFileExtension, pythonFileMimeType } from '../pybricksMicropython/lib';
import { ensureError, timestamp } from '../utils';
import {
    fileStorageArchiveAllFiles,
    fileStorageDeleteFile,
    fileStorageDidArchiveAllFiles,
    fileStorageDidChangeItem,
    fileStorageDidDeleteFile,
    fileStorageDidExportFile,
    fileStorageDidFailToArchiveAllFiles,
    fileStorageDidFailToDeleteFile,
    fileStorageDidFailToExportFile,
    fileStorageDidFailToInitialize,
    fileStorageDidFailToReadFile,
    fileStorageDidFailToWriteFile,
    fileStorageDidInitialize,
    fileStorageDidReadFile,
    fileStorageDidRemoveItem,
    fileStorageDidWriteFile,
    fileStorageExportFile,
    fileStorageReadFile,
    fileStorageWriteFile,
} from './actions';

/**
 * Converts localForage change events to redux actions.
 * @param change The storage change event.
 */
function* handleFileStorageDidChange(change: LocalForageObservableChange): Generator {
    switch (change.methodName) {
        case 'setItem':
            if (change.success) {
                yield* put(fileStorageDidChangeItem(change.key));
            }
            break;
        case 'removeItem':
            if (change.success) {
                yield* put(fileStorageDidRemoveItem(change.key));
            }
            break;
    }
}

/**
 * Handles requests to read a file.
 * @param files The storage instance.
 * @param action The requested action.
 */
function* handleReadFile(
    files: LocalForage,
    action: ReturnType<typeof fileStorageReadFile>,
): Generator {
    try {
        const value = yield* call(() => files.getItem<string>(action.fileName));

        if (value === null) {
            throw new Error('file does not exist');
        }

        yield* put(fileStorageDidReadFile(action.fileName, value));
    } catch (err) {
        yield* put(fileStorageDidFailToReadFile(action.fileName, ensureError(err)));
    }
}

/**
 * Saves the file contents to storage.
 * @param files The localForage instance.
 * @param action The action that triggered this saga.
 */
function* handleWriteFile(
    files: LocalForage,
    action: ReturnType<typeof fileStorageWriteFile>,
) {
    try {
        yield* call(() => files.setItem(action.fileName, action.fileContents));
        yield* put(fileStorageDidWriteFile(action.fileName));
    } catch (err) {
        yield* put(fileStorageDidFailToWriteFile(action.fileName, ensureError(err)));
    }
}

function* handleExportFile(
    files: LocalForage,
    action: ReturnType<typeof fileStorageExportFile>,
): Generator {
    const data = yield* call(() => files.getItem<string>(action.fileName));

    if (data === null) {
        yield* put(
            fileStorageDidFailToExportFile(
                action.fileName,
                new Error('file does not exist'),
            ),
        );
        return;
    }

    const blob = new Blob([data], { type: 'text/x-python;charset=utf-8' });

    if (window.showSaveFilePicker) {
        // This uses https://wicg.github.io/file-system-access which is not
        // available in all browsers
        try {
            const handle = yield* call(() =>
                window.showSaveFilePicker({
                    suggestedName: action.fileName,
                    types: [
                        {
                            accept: { [pythonFileMimeType]: pythonFileExtension },
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
            yield* put(
                fileStorageDidFailToExportFile(action.fileName, ensureError(err)),
            );
            return;
        }
    } else {
        // this is a fallback to use the standard browser download mechanism
        try {
            FileSaver.saveAs(blob, action.fileName);
        } catch (err) {
            yield* put(
                fileStorageDidFailToExportFile(action.fileName, ensureError(err)),
            );
            return;
        }
    }

    yield* put(fileStorageDidExportFile(action.fileName));
}

/**
 * Deletes a file from storage.
 * @param files The localForage instance.
 * @param action The action that triggered this saga.
 */
function* handleDeleteFile(
    files: LocalForage,
    action: ReturnType<typeof fileStorageDeleteFile>,
) {
    try {
        yield* call(() => files.removeItem(action.fileName));
        yield* put(fileStorageDidDeleteFile(action.fileName));
    } catch (err) {
        yield* put(fileStorageDidFailToDeleteFile(action.fileName, ensureError(err)));
    }
}

function* handleArchiveAllFiles(files: LocalForage): Generator {
    try {
        const zip = new JSZip();

        yield* call(() =>
            files.iterate<string, void>((value, key) => {
                zip.file(key, value);
            }),
        );

        const zipData = yield* call(() => zip.generateAsync({ type: 'blob' }));

        const suggestedName = `pybricks-backup-${timestamp()}.zip`;

        if (window.showSaveFilePicker) {
            // This uses https://wicg.github.io/file-system-access which is not
            // available in all browsers
            const handle = yield* call(() =>
                window.showSaveFilePicker({
                    suggestedName,
                    types: [
                        {
                            accept: { 'application/zip': '.zip' },
                            // TODO: translate description
                            description: 'Zip Files',
                        },
                    ],
                }),
            );

            const writeable = yield* call(() => handle.createWritable());
            yield* call(() => writeable.write(zipData));
            yield* call(() => writeable.close());
        } else {
            // this is a fallback to use the standard browser download mechanism
            FileSaver.saveAs(zipData, suggestedName);
        }

        yield* put(fileStorageDidArchiveAllFiles());
    } catch (err) {
        yield* put(fileStorageDidFailToArchiveAllFiles(ensureError(err)));
    }
}

/**
 * Initializes the storage backend.
 */
function* initialize(): Generator {
    try {
        // set up storage

        const files = extendPrototype(
            localForage.createInstance({ name: 'fileStorage' }),
        );

        files.newObservable.factory = (subscribe) =>
            // @ts-expect-error localforage-observable Subscription is missing
            // closed property compared to zen-observable Subscription.
            new Observable(subscribe);

        yield* call(() => files.ready());

        // migrate from old storage

        // Previous versions of pybricks code used local storage to save a single program.
        const oldProgram = localStorage.getItem('program');

        if (oldProgram !== null) {
            yield* call(() => files.setItem('main.py', oldProgram));
            localStorage.removeItem('program');
        }

        // wire storage observable to redux-sagas

        files.configObservables({
            crossTabNotification: true,
            crossTabChangeDetection: true,
        });

        const localForageChannel = eventChannel<LocalForageObservableChange>((emit) => {
            const filesObservable = files.newObservable({
                crossTabNotification: true,
            });

            const subscription = filesObservable.subscribe({
                next: (value) => emit(value),
            });

            return () => subscription.unsubscribe();
        });

        // subscribe to events

        yield* takeEvery(localForageChannel, handleFileStorageDidChange);
        yield* takeEvery(fileStorageReadFile, handleReadFile, files);
        yield* takeEvery(fileStorageWriteFile, handleWriteFile, files);
        yield* takeEvery(fileStorageDeleteFile, handleDeleteFile, files);
        yield* takeEvery(fileStorageExportFile, handleExportFile, files);
        yield* takeEvery(fileStorageArchiveAllFiles, handleArchiveAllFiles, files);

        const fileNames = yield* call(() => files.keys());

        // TODO: we should not be loading main.py here
        // HACK: This assumes that editor is loaded before storage!
        const editor = yield* getContext<EditorType>('editor');

        if (editor) {
            const main = yield* call(() => files.getItem<string>('main.py'));

            if (main) {
                editor.setValue(main);
            }
        } else if (process.env.NODE_ENV !== 'test') {
            console.error('editor was not loaded, so main.py was not loaded');
        }

        yield* put(fileStorageDidInitialize(fileNames));
    } catch (err) {
        yield* put(fileStorageDidFailToInitialize(ensureError(err)));
    }
}

export default function* (): Generator {
    yield* fork(initialize);
}
