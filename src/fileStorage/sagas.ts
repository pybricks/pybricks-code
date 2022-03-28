// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { fileSave } from 'browser-fs-access';
import Dexie, { Table } from 'dexie';
import {
    ICreateChange,
    IDatabaseChange,
    IDeleteChange,
    IUpdateChange,
} from 'dexie-observable/api';
import 'dexie-observable';
import JSZip from 'jszip';
import { eventChannel } from 'redux-saga';
import { call, fork, put, take, takeEvery } from 'typed-redux-saga/macro';
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
    fileStorageDidFailToRenameFile,
    fileStorageDidFailToWriteFile,
    fileStorageDidInitialize,
    fileStorageDidReadFile,
    fileStorageDidRemoveItem,
    fileStorageDidRenameFile,
    fileStorageDidWriteFile,
    fileStorageExportFile,
    fileStorageReadFile,
    fileStorageRenameFile,
    fileStorageWriteFile,
} from './actions';

// HACK: we have to redefine DatabaseChangeType since it is a const enum
// https://ncjamieson.com/dont-export-const-enums
const enum DatabaseChangeType {
    Create = 1,
    Update = 2,
    Delete = 3,
}

/** Type discriminator for {@link ICreateChange} */
function isCreateChange(change: IDatabaseChange): change is ICreateChange {
    return change.type === Number(DatabaseChangeType.Create);
}

/** Type discriminator for {@link IUpdateChange} */
function isUpdateChange(change: IDatabaseChange): change is IUpdateChange {
    return change.type === Number(DatabaseChangeType.Update);
}

/** Type discriminator for {@link IDeleteChange} */
function isDeleteChange(change: IDatabaseChange): change is IDeleteChange {
    return change.type === Number(DatabaseChangeType.Delete);
}

/** Type discriminator for {@link ICreateChange} of {@link FileMetadata} */
function isFileMetadataCreateChange(
    change: ICreateChange,
): change is Omit<ICreateChange, 'key' | 'obj'> & { key: string; obj: FileMetadata } {
    return change.table === 'metadata';
}

/** Type discriminator for {@link IUpdateChange} of {@link FileMetadata} */
function isFileMetadataUpdateChange(change: IUpdateChange): change is Omit<
    IUpdateChange,
    'key' | 'obj' | 'oldObj'
> & {
    key: string;
    obj: FileMetadata;
    oldObj: FileMetadata;
} {
    return change.table === 'metadata';
}

/** Type discriminator for {@link IDeleteChange} of {@link FileMetadata} */
function isFileMetaDataDeleteChange(change: IDeleteChange): change is Omit<
    IDeleteChange,
    'key' | 'oldObj'
> & {
    key: string;
    oldObj: FileMetadata;
} {
    return change.table === 'metadata';
}

/** Database metadata table data type. */
type FileMetadata = {
    /** A globally unique identifier that serves a a file handle. */
    uuid?: string;
    /** The path of the file in storage. */
    path: string;
};

/** Database contents table data type. */
type FileContents = {
    /** The path of the file in storage. */
    path: string;
    /** The contents of the file. */
    contents: string;
};

class FileStorageDb extends Dexie {
    metadata!: Table<FileMetadata, string>;
    // NB: This table starts with an underscore to hide it from Dexie observable.
    // In the future we may change this to use File Access API or some other
    // storage, so we don't want to rely on the file contents being included
    // with the metadata.
    _contents!: Table<FileContents, string>;

    constructor() {
        super('pybricks.fileStorage');
        this.version(1).stores({
            metadata: '$$uuid, &path',
            _contents: 'path, contents',
        });
    }
}

/**
 * Converts localForage change events to redux actions.
 * @param changes The list of changes from the 'changed' event.
 */
function* handleFileStorageDidChange(changes: IDatabaseChange[]): Generator {
    for (const change of changes) {
        if (isCreateChange(change)) {
            if (isFileMetadataCreateChange(change)) {
                yield* put(fileStorageDidChangeItem(change.obj.path));
            }
        } else if (isUpdateChange(change)) {
            if (isFileMetadataUpdateChange(change)) {
                if (change.oldObj.path !== change.obj.path) {
                    // TODO: need to introduce a DidCreate action
                    yield* put(fileStorageDidChangeItem(change.obj.path));
                    yield* put(fileStorageDidRemoveItem(change.oldObj.path));
                }
            }
        } else if (isDeleteChange(change)) {
            if (isFileMetaDataDeleteChange(change)) {
                yield* put(fileStorageDidRemoveItem(change.oldObj.path));
            }
        }
    }
}

/**
 * Handles requests to read a file.
 * @param db The database instance.
 * @param action The requested action.
 */
function* handleReadFile(
    db: FileStorageDb,
    action: ReturnType<typeof fileStorageReadFile>,
): Generator {
    try {
        const file = yield* call(() =>
            db.transaction('r', db.metadata, db._contents, async () => {
                const metadata = await db.metadata.get(action.fileName);

                if (!metadata) {
                    return undefined;
                }

                return db._contents.get(metadata.path);
            }),
        );

        if (!file) {
            throw new Error('file does not exist');
        }

        yield* put(fileStorageDidReadFile(action.fileName, file.contents));
    } catch (err) {
        yield* put(fileStorageDidFailToReadFile(action.fileName, ensureError(err)));
    }
}

/**
 * Saves the file contents to storage.
 * @param db The database instance.
 * @param action The action that triggered this saga.
 */
function* handleWriteFile(
    db: FileStorageDb,
    action: ReturnType<typeof fileStorageWriteFile>,
) {
    try {
        yield* call(() =>
            db.transaction('rw', db.metadata, db._contents, async () => {
                await db.metadata.put({
                    uuid: action.fileName,
                    path: action.fileName,
                });
                await db._contents.put({
                    path: action.fileName,
                    contents: action.fileContents,
                });
            }),
        );
        yield* put(fileStorageDidWriteFile(action.fileName));
    } catch (err) {
        yield* put(fileStorageDidFailToWriteFile(action.fileName, ensureError(err)));
    }
}

function* handleExportFile(
    db: FileStorageDb,
    action: ReturnType<typeof fileStorageExportFile>,
): Generator {
    const file = yield* call(() =>
        db.transaction('r', db.metadata, db._contents, async () => {
            const metadata = await db.metadata.get(action.fileName);

            if (!metadata) {
                return undefined;
            }

            return db._contents.get(metadata.path);
        }),
    );

    if (!file) {
        yield* put(
            fileStorageDidFailToExportFile(
                action.fileName,
                new Error('file does not exist'),
            ),
        );
        return;
    }

    const blob = new Blob([file.contents], { type: `${pythonFileMimeType}` });

    try {
        yield* call(() =>
            fileSave(blob, {
                id: 'pybricksCodeFileStorageExport',
                fileName: action.fileName,
                extensions: [pythonFileExtension],
                mimeTypes: [pythonFileMimeType],
                // TODO: translate description
                description: 'Python Files',
            }),
        );

        yield* put(fileStorageDidExportFile(action.fileName));
    } catch (err) {
        yield* put(fileStorageDidFailToExportFile(action.fileName, ensureError(err)));
    }
}

/**
 * Deletes a file from storage.
 * @param db The database instance.
 * @param action The action that triggered this saga.
 */
function* handleDeleteFile(
    db: FileStorageDb,
    action: ReturnType<typeof fileStorageDeleteFile>,
) {
    try {
        yield* call(() =>
            db.transaction('rw', db.metadata, db._contents, async () => {
                const metadata = await db.metadata.get(action.fileName);

                if (!metadata) {
                    throw new Error(
                        `cannot rename: file '${action.fileName}' does not exist in db`,
                    );
                }

                await db.metadata.delete(action.fileName);
                await db._contents.delete(metadata.path);
            }),
        );
        yield* put(fileStorageDidDeleteFile(action.fileName));
    } catch (err) {
        yield* put(fileStorageDidFailToDeleteFile(action.fileName, ensureError(err)));
    }
}

/**
 * Renames a file in storage.
 * @param db The database instance.
 * @param action The action that triggered this saga.
 */
function* handleRenameFile(
    db: FileStorageDb,
    action: ReturnType<typeof fileStorageRenameFile>,
) {
    try {
        yield* call(() =>
            db.transaction('rw', db.metadata, db._contents, async () => {
                const metadata = await db.metadata.get(action.oldName);

                if (!metadata) {
                    throw new Error(
                        `cannot rename: file '${action.oldName}' does not exist in db`,
                    );
                }

                const oldFile = await db._contents.get(metadata.path);

                if (!oldFile) {
                    throw new Error(
                        `cannot rename: file '${action.oldName}' does not exist in storage`,
                    );
                }

                const newFile = await db._contents.get(action.newName);

                if (newFile) {
                    throw new Error(
                        `cannot rename: file '${action.newName}' already exists`,
                    );
                }

                await db._contents.delete(action.oldName);
                await db._contents.add({ ...oldFile, path: action.newName });

                await db.metadata.put({ ...metadata, path: action.newName });
            }),
        );

        yield* put(fileStorageDidRenameFile(action.oldName, action.newName));
    } catch (err) {
        yield* put(
            fileStorageDidFailToRenameFile(
                action.oldName,
                action.newName,
                ensureError(err),
            ),
        );
    }
}

function* handleArchiveAllFiles(db: FileStorageDb): Generator {
    try {
        const zip = new JSZip();

        yield* call(() => db._contents.each((f) => zip.file(f.path, f.contents)));

        const zipData = yield* call(() => zip.generateAsync({ type: 'blob' }));

        const fileName = `pybricks-backup-${timestamp()}.zip`;

        yield* call(() =>
            fileSave(zipData, {
                id: 'pybricksCodeFileStorageArchive',
                fileName,
                extensions: ['.zip'],
                mimeTypes: ['application/zip'],
                // TODO: translate description
                description: 'Zip Files',
            }),
        );

        yield* put(fileStorageDidArchiveAllFiles());
    } catch (err) {
        yield* put(fileStorageDidFailToArchiveAllFiles(ensureError(err)));
    }
}

/**
 * Initializes the storage backend.
 */
function* initialize(): Generator {
    const defer = new Array<(...args: unknown[]) => unknown>();

    try {
        const db = new FileStorageDb();

        // migrate from old storage

        // NB: this is a one-shot event, so we don't need to unsubscribe
        db.on('ready', async () => {
            // Previous versions of pybricks code used local storage to save a single program.
            const oldProgram = localStorage.getItem('program');

            if (oldProgram !== null) {
                await db.transaction('rw', db.metadata, db._contents, async () => {
                    await db.metadata.add({ uuid: 'main.py', path: 'main.py' });
                    await db._contents.add({ path: 'main.py', contents: oldProgram });
                });
                localStorage.removeItem('program');
            }
        });

        yield* call(() => db.open());
        defer.push(() => db.close());

        // wire storage observable to redux-sagas

        const changesChan = eventChannel<IDatabaseChange[]>((emit) => {
            db.on('changes').subscribe(emit);
            return () => db.on('changes').unsubscribe(emit);
        });

        defer.push(() => changesChan.close());

        // subscribe to events

        yield* takeEvery(changesChan, handleFileStorageDidChange);
        yield* takeEvery(fileStorageReadFile, handleReadFile, db);
        yield* takeEvery(fileStorageWriteFile, handleWriteFile, db);
        yield* takeEvery(fileStorageDeleteFile, handleDeleteFile, db);
        yield* takeEvery(fileStorageRenameFile, handleRenameFile, db);
        yield* takeEvery(fileStorageExportFile, handleExportFile, db);
        yield* takeEvery(fileStorageArchiveAllFiles, handleArchiveAllFiles, db);

        const files = yield* call(() => db.metadata.toArray());

        yield* put(fileStorageDidInitialize(files.map((f) => f.path)));

        // this blocks "forever" until canceled so that the finally
        // clause will run cleanup code at the appropriate time
        yield* take('__never__');
    } catch (err) {
        yield* put(fileStorageDidFailToInitialize(ensureError(err)));
    } finally {
        for (const callback of defer.reverse()) {
            yield* call(callback);
        }
    }
}

export default function* (): Generator {
    yield* fork(initialize);
}
