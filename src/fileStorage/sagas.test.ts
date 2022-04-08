// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import 'dexie-observable';
import { AsyncSaga, uuid } from '../../test';
import { createCountFunc } from '../utils/iter';
import {
    FD,
    FileMetadata,
    FileOpenMode,
    fileStorageClose,
    fileStorageCopyFile,
    fileStorageDeleteFile,
    fileStorageDidAddItem,
    fileStorageDidChangeItem,
    fileStorageDidClose,
    fileStorageDidCopyFile,
    fileStorageDidDeleteFile,
    fileStorageDidDumpAllFiles,
    fileStorageDidFailToCopyFile,
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
import fileStorage from './sagas';

/** SHA256 hash of '' */
const emptyFileSha256 =
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

beforeEach(() => {
    // deterministic UUID generator for repeatable tests
    const nextId = createCountFunc();
    Dexie.Observable.createUUID = () => uuid(nextId());
});

afterEach(async () => {
    jest.restoreAllMocks();

    await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase('pybricks.fileStorage');
        request.addEventListener('success', resolve);
        request.addEventListener('error', reject);
    });

    localStorage.clear();
});

/**
 * helper function that writes test file to storage for later use in a test
 * @param saga The saga.
 * @returns The test file metadata and test file contents.
 */
async function setUpTestFile(saga: AsyncSaga): Promise<[FileMetadata, string]> {
    const testFilePath = 'test.file';
    const testFileId = uuid(0);
    const testFileContents = 'test file contents';
    const testFileContentsSha256 =
        'c4fa968a745586faaa030054f51fb1cafd5e9ae25fa6b137ac6477715fdc81b1';

    const testFile: FileMetadata = {
        uuid: testFileId,
        path: testFilePath,
        sha256: testFileContentsSha256,
    };

    const emptyFile: FileMetadata = { ...testFile, sha256: emptyFileSha256 };

    saga.put(fileStorageOpen(testFilePath, 'w'));

    const didOpen = await saga.take();

    if (!fileStorageDidOpen.matches(didOpen)) {
        fail(didOpen);
    }

    await expect(saga.take()).resolves.toEqual(fileStorageDidAddItem(emptyFile));

    saga.put(fileStorageWrite(didOpen.fd, testFileContents));

    await expect(saga.take()).resolves.toEqual(fileStorageDidWrite(didOpen.fd));
    await expect(saga.take()).resolves.toEqual(
        fileStorageDidChangeItem(emptyFile, testFile),
    );

    saga.put(fileStorageClose(didOpen.fd));

    await expect(saga.take()).resolves.toEqual(fileStorageDidClose(didOpen.fd));

    return [testFile, testFileContents];
}

describe('initialize', () => {
    it('should migrate old program from local storage during initialization', async () => {
        const oldProgramKey = 'program';
        const oldProgramContents = '# test program';
        const oldProgramContentsSha256 =
            '31c21eb39c9276341d9364f6d4bcac46a4aa3768bc2626f8aa742c46e3e0fdd6';

        // add item to localStorage to simulate an existing program
        localStorage.setItem(oldProgramKey, oldProgramContents);
        expect(localStorage.getItem(oldProgramKey)).toBe(oldProgramContents);

        const saga = new AsyncSaga(fileStorage);

        // initialization should remove the localStorage entry and add add it to
        // new storage backend
        await expect(saga.take()).resolves.toEqual(
            fileStorageDidInitialize([
                { uuid: uuid(0), path: 'main.py', sha256: oldProgramContentsSha256 },
            ]),
        );
        expect(localStorage.getItem(oldProgramKey)).toBeNull();

        await saga.end();
    });

    it('should catch error', async () => {
        const testError = new Error('test error');

        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw testError;
        });

        const saga = new AsyncSaga(fileStorage);

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToInitialize(testError),
        );

        await saga.end();
    });
});

describe('open', () => {
    let saga: AsyncSaga;

    beforeEach(async () => {
        saga = new AsyncSaga(fileStorage);

        await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));
    });

    it('should fail to open for reading if file does not exist', async () => {
        saga.put(fileStorageOpen('test.file', 'r'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToOpen(
                'test.file',
                new Error("file 'test.file' does not exist"),
            ),
        );
    });

    describe('should open file for writing if file does not exist', () => {
        beforeEach(async () => {
            saga.put(fileStorageOpen('test.file', 'w'));

            await expect(saga.take()).resolves.toEqual(
                fileStorageDidOpen('test.file', 0 as FD),
            );

            await expect(saga.take()).resolves.toEqual(
                fileStorageDidAddItem({
                    uuid: uuid(0),
                    path: 'test.file',
                    sha256: emptyFileSha256,
                }),
            );
        });

        describe('should fail to open if file is already open for writing', () => {
            it.each<FileOpenMode>(['r', 'w'])('mode: %o', async (mode) => {
                saga.put(fileStorageOpen('test.file', mode));

                await expect(saga.take()).resolves.toEqual(
                    fileStorageDidFailToOpen(
                        'test.file',
                        new Error("file 'test.file' is already in use"),
                    ),
                );
            });
        });

        afterEach(async () => {
            saga.put(fileStorageClose(0 as FD));

            await expect(saga.take()).resolves.toEqual(fileStorageDidClose(0 as FD));
        });
    });

    describe('should open file if file exists', () => {
        beforeEach(async () => {
            await setUpTestFile(saga);
        });

        it.each<FileOpenMode>(['r', 'w'])('mode: %o', async (mode) => {
            saga.put(fileStorageOpen('test.file', mode));

            await expect(saga.take()).resolves.toEqual(
                fileStorageDidOpen('test.file', 1 as FD),
            );
        });
    });

    it('should allow multiple readers', async () => {
        await setUpTestFile(saga);

        saga.put(fileStorageOpen('test.file', 'r'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidOpen('test.file', 1 as FD),
        );

        saga.put(fileStorageOpen('test.file', 'r'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidOpen('test.file', 2 as FD),
        );
    });

    it('should fail to open for writing if already open for reading', async () => {
        await setUpTestFile(saga);

        saga.put(fileStorageOpen('test.file', 'r'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidOpen('test.file', 1 as FD),
        );

        saga.put(fileStorageOpen('test.file', 'w'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToOpen(
                'test.file',
                new Error("file 'test.file' is already in use"),
            ),
        );
    });

    it('should allow calling close multiple times', async () => {
        saga.put(fileStorageOpen('test.file', 'w'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidOpen('test.file', 0 as FD),
        );

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidAddItem({
                uuid: uuid(0),
                path: 'test.file',
                sha256: emptyFileSha256,
            }),
        );

        saga.put(fileStorageClose(0 as FD));

        await expect(saga.take()).resolves.toEqual(fileStorageDidClose(0 as FD));

        saga.put(fileStorageClose(0 as FD));

        await expect(saga.take()).resolves.toEqual(fileStorageDidClose(0 as FD));
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('read', () => {
    let saga: AsyncSaga;

    beforeEach(async () => {
        saga = new AsyncSaga(fileStorage);
        await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));
    });

    describe('should read an open file', () => {
        it.each<FileOpenMode>(['r', 'w'])('mode: %o', async (mode) => {
            const [, contents] = await setUpTestFile(saga);

            saga.put(fileStorageOpen('test.file', mode));

            await expect(saga.take()).resolves.toEqual(
                fileStorageDidOpen('test.file', 1 as FD),
            );

            saga.put(fileStorageRead(1 as FD));

            await expect(saga.take()).resolves.toEqual(
                fileStorageDidRead(1 as FD, contents),
            );
        });
    });

    describe('should fail to read a closed file', () => {
        it.each<FileOpenMode>(['r', 'w'])('mode: %o', async (mode) => {
            await setUpTestFile(saga);

            saga.put(fileStorageOpen('test.file', mode));

            await expect(saga.take()).resolves.toEqual(
                fileStorageDidOpen('test.file', 1 as FD),
            );

            saga.put(fileStorageClose(1 as FD));

            await expect(saga.take()).resolves.toEqual(fileStorageDidClose(1 as FD));

            saga.put(fileStorageRead(1 as FD));

            await expect(saga.take()).resolves.toEqual(
                fileStorageDidFailToRead(
                    1 as FD,
                    new Error('file descriptor 1 is not open'),
                ),
            );
        });
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('write', () => {
    let saga: AsyncSaga;

    beforeEach(async () => {
        saga = new AsyncSaga(fileStorage);
        await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));
    });

    it('should write a file open for writing', async () => {
        await setUpTestFile(saga);

        saga.put(fileStorageOpen('test.file', 'w'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidOpen('test.file', 1 as FD),
        );

        saga.put(fileStorageWrite(1 as FD, 'new contents'));

        await expect(saga.take()).resolves.toEqual(fileStorageDidWrite(1 as FD));
    });

    it('should fail to write a file open for reading', async () => {
        await setUpTestFile(saga);

        saga.put(fileStorageOpen('test.file', 'r'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidOpen('test.file', 1 as FD),
        );

        saga.put(fileStorageWrite(1 as FD, 'new contents'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToWrite(
                1 as FD,
                new Error('file descriptor 1 is not open for writing'),
            ),
        );
    });

    describe('should fail to write a closed file', () => {
        it.each<FileOpenMode>(['r', 'w'])('mode: %o', async (mode) => {
            await setUpTestFile(saga);

            saga.put(fileStorageOpen('test.file', mode));

            await expect(saga.take()).resolves.toEqual(
                fileStorageDidOpen('test.file', 1 as FD),
            );

            saga.put(fileStorageClose(1 as FD));

            await expect(saga.take()).resolves.toEqual(fileStorageDidClose(1 as FD));

            saga.put(fileStorageWrite(1 as FD, 'new contents'));

            await expect(saga.take()).resolves.toEqual(
                fileStorageDidFailToWrite(
                    1 as FD,
                    new Error('file descriptor 1 is not open'),
                ),
            );
        });
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('readFile', () => {
    let saga: AsyncSaga;

    beforeEach(async () => {
        saga = new AsyncSaga(fileStorage);
        await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));

        saga.put(fileStorageReadFile('test.file'));

        await expect(saga.take()).resolves.toEqual(fileStorageOpen('test.file', 'r'));
    });

    it('should forward open error', async () => {
        const error = new Error('open test file failed');
        saga.put(fileStorageDidFailToOpen('test.file', error));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToReadFile('test.file', error),
        );
    });

    describe('should open file', () => {
        beforeEach(async () => {
            saga.put(fileStorageDidOpen('test.file', 0 as FD));

            await expect(saga.take()).resolves.toEqual(fileStorageRead(0 as FD));
        });

        it('should forward read error', async () => {
            const error = new Error('test fail to read');
            saga.put(fileStorageDidFailToRead(0 as FD, error));

            // file should be closed before we get fileStorageDidFailToReadFile

            await expect(saga.take()).resolves.toEqual(fileStorageClose(0 as FD));

            saga.put(fileStorageDidClose(0 as FD));

            await expect(saga.take()).resolves.toEqual(
                fileStorageDidFailToReadFile('test.file', error),
            );
        });

        it('should return file contents', async () => {
            const contents = 'test read contents';
            saga.put(fileStorageDidRead(0 as FD, contents));

            // file should be closed before we get fileStorageDidReadFile

            await expect(saga.take()).resolves.toEqual(fileStorageClose(0 as FD));

            saga.put(fileStorageDidClose(0 as FD));

            await expect(saga.take()).resolves.toEqual(
                fileStorageDidReadFile('test.file', contents),
            );
        });
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('writeFile', () => {
    let saga: AsyncSaga;
    const contents = 'test write file contents';

    beforeEach(async () => {
        saga = new AsyncSaga(fileStorage);
        await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));

        saga.put(fileStorageWriteFile('test.file', contents));

        await expect(saga.take()).resolves.toEqual(fileStorageOpen('test.file', 'w'));
    });

    it('should forward open error', async () => {
        const error = new Error('open test file failed');
        saga.put(fileStorageDidFailToOpen('test.file', error));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToWriteFile('test.file', error),
        );
    });

    describe('should open file', () => {
        beforeEach(async () => {
            saga.put(fileStorageDidOpen('test.file', 0 as FD));

            await expect(saga.take()).resolves.toEqual(
                fileStorageWrite(0 as FD, contents),
            );
        });

        it('should forward write error', async () => {
            const error = new Error('test fail to write');
            saga.put(fileStorageDidFailToWrite(0 as FD, error));

            // file should be closed before we get fileStorageDidFailToWriteFile

            await expect(saga.take()).resolves.toEqual(fileStorageClose(0 as FD));

            saga.put(fileStorageDidClose(0 as FD));

            await expect(saga.take()).resolves.toEqual(
                fileStorageDidFailToWriteFile('test.file', error),
            );
        });

        it('should return', async () => {
            saga.put(fileStorageDidWrite(0 as FD));

            // file should be closed before we get fileStorageDidWriteFile

            await expect(saga.take()).resolves.toEqual(fileStorageClose(0 as FD));

            saga.put(fileStorageDidClose(0 as FD));

            await expect(saga.take()).resolves.toEqual(
                fileStorageDidWriteFile('test.file'),
            );
        });
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('copyFile', () => {
    let saga: AsyncSaga;
    let testFile: FileMetadata;

    beforeEach(async () => {
        saga = new AsyncSaga(fileStorage);

        await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));
        [testFile] = await setUpTestFile(saga);
    });

    it('should fail if file does not exist', async () => {
        saga.put(fileStorageCopyFile('other.file', 'new.file'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToCopyFile(
                'other.file',
                new Error("file 'other.file' does not exist"),
            ),
        );
    });

    it('should fail if new file is open', async () => {
        saga.put(fileStorageOpen('new.file', 'w'));
        await expect(saga.take()).resolves.toEqual(
            fileStorageDidOpen('new.file', 1 as FD),
        );

        saga.put(fileStorageCopyFile('test.file', 'new.file'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToCopyFile(
                'test.file',
                new Error("file 'new.file' is in use"),
            ),
        );
    });

    it('should fail if new file exists', async () => {
        saga.put(fileStorageOpen('new.file', 'w'));
        await expect(saga.take()).resolves.toEqual(
            fileStorageDidOpen('new.file', 1 as FD),
        );

        saga.put(fileStorageClose(1 as FD));
        await expect(saga.take()).resolves.toEqual(fileStorageDidClose(1 as FD));

        saga.put(fileStorageCopyFile('test.file', 'new.file'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToCopyFile(
                'test.file',
                new Error("file 'new.file' already exists"),
            ),
        );
    });

    it('should copy file', async () => {
        saga.put(fileStorageCopyFile('test.file', 'new.file'));

        await expect(saga.take()).resolves.toEqual(fileStorageDidCopyFile('test.file'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidAddItem({ ...testFile, uuid: uuid(1), path: 'new.file' }),
        );
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('deleteFile', () => {
    let saga: AsyncSaga;
    let testFile: FileMetadata;

    beforeEach(async () => {
        saga = new AsyncSaga(fileStorage);

        await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));
        [testFile] = await setUpTestFile(saga);
    });

    it('should fail if file does not exist', async () => {
        saga.put(fileStorageDeleteFile('other.file'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToDeleteFile(
                'other.file',
                new Error("file 'other.file' does not exist"),
            ),
        );
    });

    it('should fail if file is open', async () => {
        saga.put(fileStorageOpen('test.file', 'r'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidOpen('test.file', 1 as FD),
        );
        saga.put(fileStorageDeleteFile('test.file'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToDeleteFile(
                'test.file',
                new Error("file 'test.file' is in use"),
            ),
        );
    });

    it('should remove file', async () => {
        saga.put(fileStorageDeleteFile('test.file'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidDeleteFile('test.file'),
        );

        await expect(saga.take()).resolves.toEqual(fileStorageDidRemoveItem(testFile));
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('renameFile', () => {
    let saga: AsyncSaga;
    let testFile: FileMetadata;
    const newPath = 'new.file';

    beforeEach(async () => {
        saga = new AsyncSaga(fileStorage);

        await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));
        [testFile] = await setUpTestFile(saga);
    });

    it('should fail if file does not exist', async () => {
        saga.put(fileStorageRenameFile('other.file', newPath));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToRenameFile(
                'other.file',
                new Error("file 'other.file' does not exist"),
            ),
        );
    });

    it('should fail if file is open', async () => {
        saga.put(fileStorageOpen('test.file', 'r'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidOpen('test.file', 1 as FD),
        );
        saga.put(fileStorageRenameFile('test.file', newPath));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToRenameFile(
                'test.file',
                new Error("file 'test.file' is in use"),
            ),
        );
    });

    it('should fail if new path already exists', async () => {
        // there are two paths here that result in the same error
        // the first is if the file is open, e.g. in another tab

        saga.put(fileStorageOpen(newPath, 'w'));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidOpen(newPath, 1 as FD),
        );
        await expect(saga.take()).resolves.toEqual(
            fileStorageDidAddItem({
                uuid: uuid(1),
                path: newPath,
                sha256: emptyFileSha256,
            }),
        );

        saga.put(fileStorageRenameFile('test.file', newPath));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToRenameFile(
                'test.file',
                new Error("file 'new.file' already exists"),
            ),
        );

        // the second is if the file is not open but still exists in storage

        saga.put(fileStorageClose(1 as FD));

        await expect(saga.take()).resolves.toEqual(fileStorageDidClose(1 as FD));

        saga.put(fileStorageRenameFile('test.file', newPath));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToRenameFile(
                'test.file',
                new Error("file 'new.file' already exists"),
            ),
        );
    });

    it('should change file', async () => {
        saga.put(fileStorageRenameFile(testFile.path, newPath));

        const newMetadata: FileMetadata = { ...testFile, path: newPath };

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidRenameFile(testFile.path),
        );

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidChangeItem(testFile, newMetadata),
        );
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('dump all files', () => {
    let saga: AsyncSaga;
    let testFile: FileMetadata;
    let testFileContents: string;

    beforeEach(async () => {
        saga = new AsyncSaga(fileStorage);

        await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));
        [testFile, testFileContents] = await setUpTestFile(saga);
    });

    it('should archive file', async () => {
        saga.put(fileStorageDumpAllFiles());

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidDumpAllFiles([
                { path: testFile.path, contents: testFileContents },
            ]),
        );
    });

    it('should catch error', async () => {
        const testError = new Error('test error');

        jest.spyOn(Dexie.prototype, 'transaction').mockImplementation(() => {
            throw testError;
        });

        saga.put(fileStorageDumpAllFiles());

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToDumpAllFiles(testError),
        );
    });

    afterEach(async () => {
        await saga.end();
    });
});
