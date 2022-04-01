// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import * as browserFsAccess from 'browser-fs-access';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import 'dexie-observable';
import { AsyncSaga, uuid } from '../../test';
import { createCountFunc } from '../utils/iter';
import {
    FileMetadata,
    fileStorageArchiveAllFiles,
    fileStorageDeleteFile,
    fileStorageDidAddItem,
    fileStorageDidArchiveAllFiles,
    fileStorageDidChangeItem,
    fileStorageDidDeleteFile,
    fileStorageDidExportFile,
    fileStorageDidFailToArchiveAllFiles,
    fileStorageDidFailToExportFile,
    fileStorageDidFailToReadFile,
    fileStorageDidInitialize,
    fileStorageDidOpenFile,
    fileStorageDidReadFile,
    fileStorageDidRemoveItem,
    fileStorageDidRenameFile,
    fileStorageDidWriteFile,
    fileStorageExportFile,
    fileStorageOpenFile,
    fileStorageReadFile,
    fileStorageRenameFile,
    fileStorageWriteFile,
} from './actions';
import fileStorage from './sagas';

jest.mock('browser-fs-access');

beforeEach(() => {
    // deterministic UUID generator for repeatable tests
    const nextId = createCountFunc();
    Dexie.Observable.createUUID = () => uuid(nextId());
});

afterEach(async () => {
    jest.clearAllMocks();

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

    const emptyFileSha256 =
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const emptyFile: FileMetadata = { ...testFile, sha256: emptyFileSha256 };

    await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));

    saga.put(fileStorageOpenFile(testFilePath));

    await expect(saga.take()).resolves.toEqual(
        fileStorageDidOpenFile(testFilePath, testFileId),
    );
    await expect(saga.take()).resolves.toEqual(fileStorageDidAddItem(emptyFile));

    saga.put(fileStorageWriteFile(testFileId, testFileContents));

    await expect(saga.take()).resolves.toEqual(fileStorageDidWriteFile(testFileId));
    await expect(saga.take()).resolves.toEqual(
        fileStorageDidChangeItem(emptyFile, testFile),
    );

    return [testFile, testFileContents];
}

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

it('should read and write files', async () => {
    const saga = new AsyncSaga(fileStorage);

    await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));

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

    const emptyFileSha256 =
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const emptyFile: FileMetadata = { ...testFile, sha256: emptyFileSha256 };

    saga.put(fileStorageOpenFile(testFilePath));

    await expect(saga.take()).resolves.toEqual(
        fileStorageDidOpenFile(testFilePath, testFileId),
    );
    await expect(saga.take()).resolves.toEqual(fileStorageDidAddItem(emptyFile));

    // test writing a file
    saga.put(fileStorageWriteFile(testFileId, testFileContents));

    // writing file triggers response
    await expect(saga.take()).resolves.toEqual(fileStorageDidWriteFile(testFileId));

    // and as a side-effect, triggers item change as well
    await expect(saga.take()).resolves.toEqual(
        fileStorageDidChangeItem(emptyFile, testFile),
    );

    // test reading the same file back
    saga.put(fileStorageReadFile(testFileId));

    await expect(saga.take()).resolves.toEqual(
        fileStorageDidReadFile(testFileId, testFileContents),
    );

    await saga.end();
});

it('should dispatch fail action if file does not exist', async () => {
    const saga = new AsyncSaga(fileStorage);

    await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));

    const testFileId = uuid(0);

    saga.put(fileStorageReadFile(testFileId));

    await expect(saga.take()).resolves.toEqual(
        fileStorageDidFailToReadFile(testFileId, new Error('file does not exist')),
    );

    await saga.end();
});

it('should delete files', async () => {
    const saga = new AsyncSaga(fileStorage);

    const [testFile] = await setUpTestFile(saga);

    saga.put(fileStorageDeleteFile(testFile.path));

    await expect(saga.take()).resolves.toEqual(fileStorageDidDeleteFile(testFile.path));

    await expect(saga.take()).resolves.toEqual(fileStorageDidRemoveItem(testFile));

    await saga.end();
});

describe('rename', () => {
    it('should rename files', async () => {
        const newName = 'new.file';

        const saga = new AsyncSaga(fileStorage);

        const [testFile] = await setUpTestFile(saga);

        saga.put(fileStorageRenameFile(testFile.path, newName));

        const newMetadata: FileMetadata = { ...testFile, path: newName };

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidRenameFile(testFile.path),
        );
        await expect(saga.take()).resolves.toEqual(
            fileStorageDidChangeItem(testFile, newMetadata),
        );

        await saga.end();
    });
});

describe('export', () => {
    it('should fail if file does not exist', async () => {
        const testFile = 'test.file';

        const saga = new AsyncSaga(fileStorage);

        await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));

        saga.put(fileStorageExportFile(testFile));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToExportFile(testFile, new Error('file does not exist')),
        );

        await saga.end();
    });

    it('should export file', async () => {
        const saga = new AsyncSaga(fileStorage);

        const [testFile] = await setUpTestFile(saga);

        jest.spyOn(browserFsAccess, 'fileSave');

        saga.put(fileStorageExportFile(testFile.path));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidExportFile(testFile.path),
        );
        expect(browserFsAccess.fileSave).toHaveBeenCalled();

        await saga.end();
    });

    it('should catch error', async () => {
        const saga = new AsyncSaga(fileStorage);

        const [testFile] = await setUpTestFile(saga);

        const testError = new Error('test error');
        jest.spyOn(browserFsAccess, 'fileSave').mockRejectedValue(testError);

        saga.put(fileStorageExportFile(testFile.path));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToExportFile(testFile.path, testError),
        );

        await saga.end();
    });
});

describe('archive', () => {
    it('should archive file', async () => {
        const saga = new AsyncSaga(fileStorage);

        await setUpTestFile(saga);

        jest.spyOn(browserFsAccess, 'fileSave');

        saga.put(fileStorageArchiveAllFiles());

        await expect(saga.take()).resolves.toEqual(fileStorageDidArchiveAllFiles());
        expect(browserFsAccess.fileSave).toHaveBeenCalled();

        await saga.end();
    });

    it('should catch error', async () => {
        const saga = new AsyncSaga(fileStorage);

        await setUpTestFile(saga);

        const testError = new Error('test error');
        jest.spyOn(browserFsAccess, 'fileSave').mockRejectedValue(testError);

        saga.put(fileStorageArchiveAllFiles());

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToArchiveAllFiles(testError),
        );

        await saga.end();
    });
});
