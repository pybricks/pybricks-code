// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import * as browserFsAccess from 'browser-fs-access';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import 'dexie-observable';
import { AsyncSaga, uuid } from '../../test';
import { createCountFunc } from '../utils/iter';
import {
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
 * @returns The test file id and test file contents.
 */
async function setUpTestFile(saga: AsyncSaga): Promise<[string, string]> {
    const testFilePath = 'test.file';
    const testFileId = uuid(0);
    const testFileContents = 'test file contents';

    await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));

    saga.put(fileStorageOpenFile(testFilePath));

    await expect(saga.take()).resolves.toEqual(
        fileStorageDidOpenFile(testFilePath, testFileId),
    );
    await expect(saga.take()).resolves.toEqual(fileStorageDidAddItem(testFileId));

    saga.put(fileStorageWriteFile(testFileId, testFileContents));

    await expect(saga.take()).resolves.toEqual(fileStorageDidWriteFile(testFileId));
    await expect(saga.take()).resolves.toEqual(fileStorageDidChangeItem(testFileId));

    return [testFileId, testFileContents];
}

it('should migrate old program from local storage during initialization', async () => {
    const oldProgramKey = 'program';
    const oldProgramContents = '# test program';

    // add item to localStorage to simulate an existing program
    localStorage.setItem(oldProgramKey, oldProgramContents);
    expect(localStorage.getItem(oldProgramKey)).toBe(oldProgramContents);

    const saga = new AsyncSaga(fileStorage);

    // initialization should remove the localStorage entry and add add it to
    // new storage backend
    await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize(['main.py']));
    expect(localStorage.getItem(oldProgramKey)).toBeNull();

    await saga.end();
});

it('should read and write files', async () => {
    const saga = new AsyncSaga(fileStorage);

    await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));

    const testFile = 'test.file';
    const testId = uuid(0);
    const testFileContents = 'test file contents';

    saga.put(fileStorageOpenFile(testFile));

    await expect(saga.take()).resolves.toEqual(
        fileStorageDidOpenFile(testFile, testId),
    );
    await expect(saga.take()).resolves.toEqual(fileStorageDidAddItem(testId));

    // test writing a file
    saga.put(fileStorageWriteFile(testId, testFileContents));

    // writing file triggers response
    await expect(saga.take()).resolves.toEqual(fileStorageDidWriteFile(testId));

    // and as a side-effect, triggers item change as well
    await expect(saga.take()).resolves.toEqual(fileStorageDidChangeItem(testId));

    // test reading the same file back
    saga.put(fileStorageReadFile(testId));

    await expect(saga.take()).resolves.toEqual(
        fileStorageDidReadFile(testId, testFileContents),
    );

    await saga.end();
});

it('should dispatch fail action if file does not exist', async () => {
    const saga = new AsyncSaga(fileStorage);

    await expect(saga.take()).resolves.toEqual(fileStorageDidInitialize([]));

    const testFile = 'test.file';

    saga.put(fileStorageReadFile(testFile));

    await expect(saga.take()).resolves.toEqual(
        fileStorageDidFailToReadFile('test.file', new Error('file does not exist')),
    );

    await saga.end();
});

it('should delete files', async () => {
    const saga = new AsyncSaga(fileStorage);

    const [testFile] = await setUpTestFile(saga);

    saga.put(fileStorageDeleteFile(testFile));

    await expect(saga.take()).resolves.toEqual(fileStorageDidDeleteFile(testFile));

    await expect(saga.take()).resolves.toEqual(fileStorageDidRemoveItem(testFile));

    await saga.end();
});

describe('rename', () => {
    it('should rename files', async () => {
        const newName = 'new.file';

        const saga = new AsyncSaga(fileStorage);

        const [testFile] = await setUpTestFile(saga);

        saga.put(fileStorageRenameFile(testFile, newName));

        await expect(saga.take()).resolves.toEqual(fileStorageDidRenameFile(testFile));
        await expect(saga.take()).resolves.toEqual(fileStorageDidChangeItem(testFile));

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

        saga.put(fileStorageExportFile(testFile));

        await expect(saga.take()).resolves.toEqual(fileStorageDidExportFile(testFile));
        expect(browserFsAccess.fileSave).toHaveBeenCalled();

        await saga.end();
    });

    it('should catch error', async () => {
        const saga = new AsyncSaga(fileStorage);

        const [testFile] = await setUpTestFile(saga);

        const testError = new Error('test error');
        jest.spyOn(browserFsAccess, 'fileSave').mockRejectedValue(testError);

        saga.put(fileStorageExportFile(testFile));

        await expect(saga.take()).resolves.toEqual(
            fileStorageDidFailToExportFile(testFile, testError),
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
