// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import Dexie, { Table } from 'dexie';
import {
    ICreateChange,
    IDatabaseChange,
    IDeleteChange,
    IUpdateChange,
} from 'dexie-observable/api';
import 'dexie-observable';
import { eventChannel } from 'redux-saga';
import { call, fork, put, race, take, takeEvery } from 'typed-redux-saga/macro';
import { defined, ensureError } from '../utils';
import { sha256Digest } from '../utils/crypto';
import { createCountFunc } from '../utils/iter';
import {
    FD,
    FileMetadata,
    FileOpenMode,
    UUID,
    fileStorageClose,
    fileStorageDeleteFile,
    fileStorageDidAddItem,
    fileStorageDidChangeItem,
    fileStorageDidClose,
    fileStorageDidDeleteFile,
    fileStorageDidDumpAllFiles,
    fileStorageDidFailToDeleteFile,
    fileStorageDidFailToDumpAllFiles,
    fileStorageDidFailToInitialize,
    fileStorageDidFailToOpen,
    fileStorageDidFailToRead,
    fileStorageDidFailToReadFile,
    fileStorageDidFailToRenameFile,
    fileStorageDidFailToWrite,
    fileStorageDidFailToWriteFile,
    fileStorageDidInitialize,
    fileStorageDidOpen,
    fileStorageDidRead,
    fileStorageDidReadFile,
    fileStorageDidRemoveItem,
    fileStorageDidRenameFile,
    fileStorageDidWrite,
    fileStorageDidWriteFile,
    fileStorageDumpAllFiles,
    fileStorageOpen,
    fileStorageRead,
    fileStorageReadFile,
    fileStorageRenameFile,
    fileStorageWrite,
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

/** Map for keeping track of open file descriptors. */
type OpenFdMap = Map<FD, { mode: FileOpenMode; uuid: UUID }>;

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
 * Creates a namespaced lock name for the given path.
 */
function lockNameForPath(path: string): string {
    return `pybricks.fileStorage:${path}`;
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
 * @param nextFd Function to get the next file descriptor.
 * @param openFds Map of open file descriptors.
 * @param action The requested action.
 */
function* handleOpen(
    db: FileStorageDb,
    nextFd: () => FD,
    openFds: OpenFdMap,
    action: ReturnType<typeof fileStorageOpen>,
): Generator {
    try {
        const fd = nextFd();
        let lockWaiter: Promise<void>;

        const close = yield* call(
            () =>
                new Promise<(() => void) | void>((resolve, reject) => {
                    lockWaiter = navigator.locks
                        .request(
                            lockNameForPath(action.path),
                            {
                                ifAvailable: true,
                                mode: action.mode === 'w' ? 'exclusive' : 'shared',
                            },
                            (lock) => {
                                if (lock === null) {
                                    resolve();
                                    return;
                                }

                                // capture a promise new resolve function that will be used
                                // to release the lock later
                                return new Promise<void>((resolve2) =>
                                    resolve(resolve2),
                                );
                            },
                        )
                        .catch(reject);
                }),
        );

        if (!close) {
            throw new Error(`file '${action.path}' is already in use`);
        }

        let isCloseExplicitlyRequested = false;

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

                    // if reading, do not create a new file
                    if (action.mode === 'r') {
                        return;
                    }

                    // otherwise create a new empty file for writing
                    const key = await db.metadata.add((<Omit<FileMetadata, 'uuid'>>{
                        path: action.path,
                        sha256,
                    }) as FileMetadata);

                    await db._contents.put({ path: action.path, contents });

                    return key;
                }),
            );

            // uuid will be undefined if we attempted to open for reading
            // and the file does not exist
            if (!uuid) {
                throw new Error(`file '${action.path}' does not exist`);
            }

            openFds.set(fd, { mode: action.mode, uuid });

            yield* put(fileStorageDidOpen(action.path, fd));

            yield* take(fileStorageClose.when((a) => a.fd === fd));

            isCloseExplicitlyRequested = true;
        } finally {
            openFds.delete(fd);
            close();

            // this ensures that the lock is released before we send the action
            yield* call(() => lockWaiter);

            // Post fileStorageDidClose only if fileStorageClose was received.
            // If the task is canceled or fails, we don't want this extra action.
            if (isCloseExplicitlyRequested) {
                yield* put(fileStorageDidClose(fd));
            }
        }
    } catch (err) {
        yield* put(fileStorageDidFailToOpen(action.path, ensureError(err)));
    }
}

/**
 * Handles requests to close a file.
 * @param openFds The map of open file descriptors.
 * @param action The action that triggered this handler.
 */
function* handleClose(
    openFds: OpenFdMap,
    action: ReturnType<typeof fileStorageClose>,
): Generator {
    if (openFds.has(action.fd)) {
        // handleOpenFile handles closing open files so there is nothing to do here.
        return;
    }

    // Close was called more than once, which is allowed, so respond to avoid
    // blocking while waiting for response.
    yield* put(fileStorageDidClose(action.fd));
}

/**
 * Handles requests to read a file.
 * @param db The database instance.
 * @param openFds Map of open file descriptors.
 * @param action The requested action.
 */
function* handleRead(
    db: FileStorageDb,
    openFds: OpenFdMap,
    action: ReturnType<typeof fileStorageRead>,
): Generator {
    try {
        const fdInfo = openFds.get(action.fd);

        if (!fdInfo) {
            throw new Error(`file descriptor ${action.fd} is not open`);
        }

        const file = yield* call(() =>
            db.transaction('r', db.metadata, db._contents, async () => {
                const metadata = await db.metadata.get(fdInfo.uuid);

                // istanbul ignore if: file locks should prevent this from happening
                if (!metadata) {
                    return undefined;
                }

                return await db._contents.get(metadata.path);
            }),
        );

        // istanbul ignore if: file locks should prevent this from happening
        if (!file) {
            throw new Error('file does not exist');
        }

        yield* put(fileStorageDidRead(action.fd, file.contents));
    } catch (err) {
        yield* put(fileStorageDidFailToRead(action.fd, ensureError(err)));
    }
}

/**
 * Saves the file contents to storage.
 * @param db The database instance.
 * @param openFds Map of open file descriptors.
 * @param action The action that triggered this saga.
 */
function* handleWrite(
    db: FileStorageDb,
    openFds: OpenFdMap,
    action: ReturnType<typeof fileStorageWrite>,
) {
    try {
        const fdInfo = openFds.get(action.fd);

        if (!fdInfo) {
            throw new Error(`file descriptor ${action.fd} is not open`);
        }

        if (fdInfo.mode !== 'w') {
            throw new Error(`file descriptor ${action.fd} is not open for writing`);
        }

        const sha256 = yield* call(() => sha256Digest(action.contents));

        yield* call(() =>
            db.transaction('rw', db.metadata, db._contents, async () => {
                const metadata = await db.metadata.get(fdInfo.uuid);

                // istanbul ignore if: file locks should prevent this from happening
                if (!metadata) {
                    throw new Error(`file handle '${fdInfo.uuid}' does not exist`);
                }

                await db.metadata.put({ ...metadata, sha256 });
                await db._contents.put({
                    path: metadata.path,
                    contents: action.contents,
                });
            }),
        );
        yield* put(fileStorageDidWrite(action.fd));
    } catch (err) {
        yield* put(fileStorageDidFailToWrite(action.fd, ensureError(err)));
    }
}

/**
 * Handle open, read, close action.
 * @param action The action that triggered this saga.
 */
function* handleReadFile(action: ReturnType<typeof fileStorageReadFile>): Generator {
    try {
        yield* put(fileStorageOpen(action.path, 'r'));

        const { didOpen, didFailToOpen } = yield* race({
            didOpen: take(fileStorageDidOpen.when((a) => a.path === action.path)),
            didFailToOpen: take(
                fileStorageDidFailToOpen.when((a) => a.path === action.path),
            ),
        });

        if (didFailToOpen) {
            throw didFailToOpen.error;
        }

        defined(didOpen);

        let contents: string;

        try {
            yield* put(fileStorageRead(didOpen.fd));

            const { didRead, didFailToRead } = yield* race({
                didRead: take(fileStorageDidRead.when((a) => a.fd === didOpen.fd)),
                didFailToRead: take(
                    fileStorageDidFailToRead.when((a) => a.fd === didOpen.fd),
                ),
            });

            if (didFailToRead) {
                throw didFailToRead.error;
            }

            defined(didRead);

            contents = didRead.contents;
        } finally {
            yield* put(fileStorageClose(didOpen.fd));
            yield* take(fileStorageDidClose.when((a) => a.fd === didOpen.fd));
        }

        yield* put(fileStorageDidReadFile(action.path, contents));
    } catch (err) {
        yield* put(fileStorageDidFailToReadFile(action.path, ensureError(err)));
    }
}

/**
 * Handle open, write, close action.
 * @param action The action that triggered this saga.
 */
function* handleWriteFile(action: ReturnType<typeof fileStorageWriteFile>): Generator {
    try {
        yield* put(fileStorageOpen(action.path, 'w'));

        const { didOpen, didFailToOpen } = yield* race({
            didOpen: take(fileStorageDidOpen.when((a) => a.path === action.path)),
            didFailToOpen: take(
                fileStorageDidFailToOpen.when((a) => a.path === action.path),
            ),
        });

        if (didFailToOpen) {
            throw didFailToOpen.error;
        }

        defined(didOpen);

        try {
            yield* put(fileStorageWrite(didOpen.fd, action.contents));

            const { didFailToWrite } = yield* race({
                didWrite: take(fileStorageDidWrite.when((a) => a.fd === didOpen.fd)),
                didFailToWrite: take(
                    fileStorageDidFailToWrite.when((a) => a.fd === didOpen.fd),
                ),
            });

            if (didFailToWrite) {
                throw didFailToWrite.error;
            }
        } finally {
            yield* put(fileStorageClose(didOpen.fd));
            yield* take(fileStorageDidClose.when((a) => a.fd === didOpen.fd));
        }

        yield* put(fileStorageDidWriteFile(action.path));
    } catch (err) {
        yield* put(fileStorageDidFailToWriteFile(action.path, ensureError(err)));
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
            navigator.locks.request(
                lockNameForPath(action.path),
                { ifAvailable: true },
                async (lock) => {
                    if (lock === null) {
                        throw new Error(`file '${action.path}' is in use`);
                    }

                    await db.transaction('rw', db.metadata, db._contents, async () => {
                        const metadata = await db.metadata
                            .where('path')
                            .equals(action.path)
                            .first();

                        if (!metadata) {
                            throw new Error(`file '${action.path}' does not exist`);
                        }

                        await db.metadata.delete(metadata.uuid);
                        await db._contents.delete(metadata.path);
                    });
                },
            ),
        );

        yield* put(fileStorageDidDeleteFile(action.path));
    } catch (err) {
        yield* put(fileStorageDidFailToDeleteFile(action.path, ensureError(err)));
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
            navigator.locks.request(
                lockNameForPath(action.path),
                { ifAvailable: true },
                async (lock) => {
                    if (lock === null) {
                        throw new Error(`file '${action.path}' is in use`);
                    }

                    await navigator.locks.request(
                        lockNameForPath(action.newPath),
                        { ifAvailable: true },
                        async (lock2) => {
                            if (lock2 === null) {
                                throw new Error(
                                    `file '${action.newPath}' already exists`,
                                );
                            }

                            await db.transaction(
                                'rw',
                                db.metadata,
                                db._contents,
                                async () => {
                                    const metadata = await db.metadata
                                        .where('path')
                                        .equals(action.path)
                                        .first();

                                    if (!metadata) {
                                        throw new Error(
                                            `file '${action.path}' does not exist`,
                                        );
                                    }

                                    const oldName = metadata.path;

                                    const oldFile = await db._contents.get(oldName);

                                    // istanbul ignore if: file locks should prevent this from happening
                                    if (!oldFile) {
                                        throw new Error(
                                            `file '${oldName}' does not exist in storage`,
                                        );
                                    }

                                    const newFile = await db._contents.get(
                                        action.newPath,
                                    );

                                    if (newFile) {
                                        throw new Error(
                                            `file '${action.newPath}' already exists`,
                                        );
                                    }

                                    await db._contents.delete(oldName);
                                    await db._contents.add({
                                        ...oldFile,
                                        path: action.newPath,
                                    });

                                    await db.metadata.put({
                                        ...metadata,
                                        path: action.newPath,
                                    });
                                },
                            );
                        },
                    );
                },
            ),
        );

        yield* put(fileStorageDidRenameFile(action.path));
    } catch (err) {
        yield* put(fileStorageDidFailToRenameFile(action.path, ensureError(err)));
    }
}

function* handleDumpAllFiles(db: FileStorageDb): Generator {
    try {
        const dump = new Array<{ path: string; contents: string }>();

        // REVISIT: consider using dexie-export-import addon if we want to do
        // a full backup instead of just the file contents
        // https://www.npmjs.com/package/dexie-export-import

        yield* call(() =>
            db.transaction('r', db._contents, () =>
                db._contents.each((f) => dump.push(f)),
            ),
        );

        yield* put(fileStorageDidDumpAllFiles(dump));
    } catch (err) {
        yield* put(fileStorageDidFailToDumpAllFiles(ensureError(err)));
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

        const nextFd = createCountFunc() as () => FD;
        const openFds: OpenFdMap = new Map();

        yield* takeEvery(changesChan, handleFileStorageDidChange);
        yield* takeEvery(fileStorageOpen, handleOpen, db, nextFd, openFds);
        yield* takeEvery(fileStorageClose, handleClose, openFds);
        yield* takeEvery(fileStorageRead, handleRead, db, openFds);
        yield* takeEvery(fileStorageWrite, handleWrite, db, openFds);
        yield* takeEvery(fileStorageReadFile, handleReadFile);
        yield* takeEvery(fileStorageWriteFile, handleWriteFile);
        yield* takeEvery(fileStorageDeleteFile, handleDeleteFile, db);
        yield* takeEvery(fileStorageRenameFile, handleRenameFile, db);
        yield* takeEvery(fileStorageDumpAllFiles, handleDumpAllFiles, db);

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
