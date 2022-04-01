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
import { ensureError, timestamp } from '../utils';
import { sha256Digest } from '../utils/crypto';
import {
    FileMetadata,
    UUID,
    fileStorageArchiveAllFiles,
    fileStorageDeleteFile,
    fileStorageDidAddItem,
    fileStorageDidArchiveAllFiles,
    fileStorageDidChangeItem,
    fileStorageDidDeleteFile,
    fileStorageDidFailToArchiveAllFiles,
    fileStorageDidFailToDeleteFile,
    fileStorageDidFailToInitialize,
    fileStorageDidFailToOpenFile,
    fileStorageDidFailToReadFile,
    fileStorageDidFailToRenameFile,
    fileStorageDidFailToWriteFile,
    fileStorageDidInitialize,
    fileStorageDidOpenFile,
    fileStorageDidReadFile,
    fileStorageDidRemoveItem,
    fileStorageDidRenameFile,
    fileStorageDidWriteFile,
    fileStorageOpenFile,
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

/** Database contents table data type. */
type FileContents = {
    /** The path of the file in storage. */
    path: string;
    /** The contents of the file. */
    contents: string;
};

class FileStorageDb extends Dexie {
    metadata!: Table<FileMetadata, UUID>;
    // NB: This table starts with an underscore to hide it from Dexie observable.
    // In the future we may change this to use File Access API or some other
    // storage, so we don't want to rely on the file contents being included
    // with the metadata.
    _contents!: Table<FileContents, string>;

    constructor() {
        super('pybricks.fileStorage');
        this.version(1).stores({
            metadata: '$$uuid, &path, sha256',
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
                yield* put(fileStorageDidAddItem(change.obj));
            }
        } else if (isUpdateChange(change)) {
            if (isFileMetadataUpdateChange(change)) {
                yield* put(fileStorageDidChangeItem(change.oldObj, change.obj));
            }
        } else if (isDeleteChange(change)) {
            if (isFileMetaDataDeleteChange(change)) {
                yield* put(fileStorageDidRemoveItem(change.oldObj));
            }
        }
    }
}

/**
 * Handles requests to open a file.
 * @param db The database instance.
 * @param action The requested action.
 */
function* handleOpenFile(
    db: FileStorageDb,
    action: ReturnType<typeof fileStorageOpenFile>,
): Generator {
    try {
        // NB: can't await non-db functions inside of transaction, so we have
        // to do this before even if it is not used
        const contents = '';
        const sha256 = yield* call(() => sha256Digest(contents));

        const uuid = yield* call(() =>
            db.transaction('rw', db.metadata, db._contents, async () => {
                const metadata = await db.metadata
                    .where('path')
                    .equals(action.path)
                    .first();

                // if the file exists, return the existing uuid
                if (metadata) {
                    return metadata.uuid;
                }

                // otherwise create a new empty file
                const key = await db.metadata.add((<Omit<FileMetadata, 'uuid'>>{
                    path: action.path,
                    sha256,
                }) as FileMetadata);

                await db._contents.put({ path: action.path, contents });

                return key;
            }),
        );
        yield* put(fileStorageDidOpenFile(action.path, uuid));
    } catch (err) {
        yield* put(fileStorageDidFailToOpenFile(action.path, ensureError(err)));
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
                const metadata = await db.metadata.get(action.id);

                if (!metadata) {
                    return undefined;
                }

                return await db._contents.get(metadata.path);
            }),
        );

        if (!file) {
            throw new Error('file does not exist');
        }

        yield* put(fileStorageDidReadFile(action.id, file.contents));
    } catch (err) {
        yield* put(fileStorageDidFailToReadFile(action.id, ensureError(err)));
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
        const sha256 = yield* call(() => sha256Digest(action.contents));

        yield* call(() =>
            db.transaction('rw', db.metadata, db._contents, async () => {
                const metadata = await db.metadata.get(action.id);

                if (!metadata) {
                    throw new Error(`file handle '${action.id}' does not exist`);
                }

                await db.metadata.put({ ...metadata, sha256 });
                await db._contents.put({
                    path: metadata.path,
                    contents: action.contents,
                });
            }),
        );
        yield* put(fileStorageDidWriteFile(action.id));
    } catch (err) {
        yield* put(fileStorageDidFailToWriteFile(action.id, ensureError(err)));
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
                const metadata = await db.metadata
                    .where('path')
                    .equals(action.fileName)
                    .first();

                if (!metadata) {
                    throw new Error(`file '${action.fileName}' does not exist`);
                }

                await db.metadata.delete(metadata.uuid);
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
                const metadata = await db.metadata
                    .where('path')
                    .equals(action.fileName)
                    .first();

                if (!metadata) {
                    throw new Error(`file '${action.fileName}' does not exist`);
                }

                const oldName = metadata.path;

                const oldFile = await db._contents.get(oldName);

                if (!oldFile) {
                    throw new Error(`file '${oldName}' does not exist in storage`);
                }

                const newFile = await db._contents.get(action.newName);

                if (newFile) {
                    throw new Error(
                        `cannot rename: file '${action.newName}' already exists`,
                    );
                }

                await db._contents.delete(oldName);
                await db._contents.add({ ...oldFile, path: action.newName });

                await db.metadata.put({ ...metadata, path: action.newName });
            }),
        );

        yield* put(fileStorageDidRenameFile(action.fileName));
    } catch (err) {
        yield* put(fileStorageDidFailToRenameFile(action.fileName, ensureError(err)));
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

        const oldProgram = localStorage.getItem('program');

        if (oldProgram !== null) {
            // NB: Dexie only allows Promise and DexiePromise to be awaited
            // inside of 'ready' callback so we have to do digest here
            const sha256 = yield* call(() => sha256Digest(oldProgram));

            // NB: this is a one-shot event, so we don't need to unsubscribe
            db.on('ready', async () => {
                await db.transaction('rw', db.metadata, db._contents, async () => {
                    await db.metadata.add((<Omit<FileMetadata, 'uuid'>>{
                        path: 'main.py',
                        sha256,
                    }) as FileMetadata);

                    await db._contents.add({ path: 'main.py', contents: oldProgram });
                });

                localStorage.removeItem('program');
            });
        }

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
        yield* takeEvery(fileStorageOpenFile, handleOpenFile, db);
        yield* takeEvery(fileStorageReadFile, handleReadFile, db);
        yield* takeEvery(fileStorageWriteFile, handleWriteFile, db);
        yield* takeEvery(fileStorageDeleteFile, handleDeleteFile, db);
        yield* takeEvery(fileStorageRenameFile, handleRenameFile, db);
        yield* takeEvery(fileStorageArchiveAllFiles, handleArchiveAllFiles, db);

        const files = yield* call(() => db.metadata.toArray());

        yield* put(fileStorageDidInitialize(files));

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
