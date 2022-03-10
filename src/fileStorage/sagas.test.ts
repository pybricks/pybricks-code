// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import FileSaver from 'file-saver';
import { mock } from 'jest-mock-extended';
import { AsyncSaga } from '../../test';
import {
    fileStorageArchiveAllFiles,
    fileStorageDeleteFile,
    fileStorageDidArchiveAllFiles,
    fileStorageDidChangeItem,
    fileStorageDidDeleteFile,
    fileStorageDidExportFile,
    fileStorageDidFailToArchiveAllFiles,
    fileStorageDidFailToExportFile,
    fileStorageDidFailToReadFile,
    fileStorageDidInitialize,
    fileStorageDidReadFile,
    fileStorageDidRemoveItem,
    fileStorageDidWriteFile,
    fileStorageExportFile,
    fileStorageReadFile,
    fileStorageWriteFile,
} from './actions';
import fileStorage from './sagas';

jest.mock('file-saver');

beforeEach(() => {
    // localForge uses localStorage as backend in test environment, so we need
    // to start with a clean slate in each test
    localStorage.clear();
});

/**
 * helper function that writes test file to storage for later use in a test
 * @param saga The saga.
 * @returns The test file name and test file contents.
 */
async function setUpTestFile(saga: AsyncSaga): Promise<[string, string]> {
    const testFileName = 'test.file';
    const testFileContents = 'test file contents';

    const action0 = await saga.take();
    expect(action0).toEqual(fileStorageDidInitialize([]));

    saga.put(fileStorageWriteFile(testFileName, testFileContents));

    const action1 = await saga.take();
    expect(action1).toEqual(fileStorageDidWriteFile(testFileName));

    const action2 = await saga.take();
    expect(action2).toEqual(fileStorageDidChangeItem(testFileName));

    return [testFileName, testFileContents];
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
    const action = await saga.take();
    expect(action).toEqual(fileStorageDidInitialize(['main.py']));
    expect(localStorage.getItem(oldProgramKey)).toBeNull();

    await saga.end();
});

it('should read and write files', async () => {
    const saga = new AsyncSaga(fileStorage);

    let action = await saga.take();

    expect(action).toEqual(fileStorageDidInitialize([]));

    const testFileName = 'test.file';
    const testFileContents = 'test file contents';

    // test writing a file
    saga.put(fileStorageWriteFile(testFileName, testFileContents));

    // writing file triggers response
    action = await saga.take();
    expect(action).toEqual(fileStorageDidWriteFile(testFileName));

    // and as a side-effect, triggers item change as well
    action = await saga.take();
    expect(action).toEqual(fileStorageDidChangeItem(testFileName));

    // test reading the same file back
    saga.put(fileStorageReadFile(testFileName));

    action = await saga.take();
    expect(action).toEqual(fileStorageDidReadFile(testFileName, testFileContents));

    await saga.end();
});

it('should dispatch fail action if file does not exist', async () => {
    const saga = new AsyncSaga(fileStorage);

    let action = await saga.take();
    expect(action).toEqual(fileStorageDidInitialize([]));

    const testFileName = 'test.file';

    saga.put(fileStorageReadFile(testFileName));

    action = await saga.take();
    expect(fileStorageDidFailToReadFile.matches(action)).toBeTruthy();

    await saga.end();
});

it('should delete files', async () => {
    const saga = new AsyncSaga(fileStorage);

    const [testFileName] = await setUpTestFile(saga);

    saga.put(fileStorageDeleteFile(testFileName));

    const action = await saga.take();
    expect(action).toEqual(fileStorageDidDeleteFile(testFileName));

    const action2 = await saga.take();
    expect(action2).toEqual(fileStorageDidRemoveItem(testFileName));

    await saga.end();
});

describe('export', () => {
    it('should fail if file does not exist', async () => {
        const testFileName = 'test.file';

        const saga = new AsyncSaga(fileStorage);

        const action0 = await saga.take();
        expect(action0).toEqual(fileStorageDidInitialize([]));

        saga.put(fileStorageExportFile(testFileName));

        const action = await saga.take();
        expect(action).toEqual(
            fileStorageDidFailToExportFile(
                testFileName,
                new Error('file does not exist'),
            ),
        );

        await saga.end();
    });

    it('should export file with web file system api', async () => {
        const saga = new AsyncSaga(fileStorage);

        // window.showSaveFilePicker is not defined in the test environment
        // so we can't use spyOn().
        const mockWriteable = mock<FileSystemWritableFileStream>();
        const originalShowSaveFilePicker = window.showSaveFilePicker;
        window.showSaveFilePicker = jest.fn().mockResolvedValue(
            mock<FileSystemFileHandle>({
                createWritable: jest.fn().mockResolvedValue(mockWriteable),
            }),
        );

        const [testFileName] = await setUpTestFile(saga);

        saga.put(fileStorageExportFile(testFileName));

        const action = await saga.take();
        expect(action).toEqual(fileStorageDidExportFile(testFileName));
        expect(window.showSaveFilePicker).toHaveBeenCalled();
        expect(mockWriteable.write).toHaveBeenCalled();
        expect(mockWriteable.close).toHaveBeenCalled();

        await saga.end();

        window.showSaveFilePicker = originalShowSaveFilePicker;
    });

    it('should get error from web file system api', async () => {
        const saga = new AsyncSaga(fileStorage);

        // window.showSaveFilePicker is not defined in the test environment
        // so we can't use spyOn().
        const testError = new Error('test error');
        const originalShowSaveFilePicker = window.showSaveFilePicker;
        window.showSaveFilePicker = jest.fn().mockResolvedValue(
            mock<FileSystemFileHandle>({
                createWritable: jest.fn().mockRejectedValue(testError),
            }),
        );

        const [testFileName] = await setUpTestFile(saga);

        saga.put(fileStorageExportFile(testFileName));

        const action = await saga.take();
        expect(action).toEqual(fileStorageDidFailToExportFile(testFileName, testError));
        expect(window.showSaveFilePicker).toHaveBeenCalled();

        await saga.end();

        window.showSaveFilePicker = originalShowSaveFilePicker;
    });

    it('should export file using fallback', async () => {
        const saga = new AsyncSaga(fileStorage);

        const mockFileSaverSaveAs = jest.spyOn(FileSaver, 'saveAs');

        const [testFileName] = await setUpTestFile(saga);

        saga.put(fileStorageExportFile(testFileName));

        const action = await saga.take();
        expect(action).toEqual(fileStorageDidExportFile(testFileName));
        expect(mockFileSaverSaveAs).toHaveBeenCalled();

        await saga.end();

        mockFileSaverSaveAs.mockRestore();
    });

    it('should get error from fallback', async () => {
        const saga = new AsyncSaga(fileStorage);

        const testError = new Error('test error');
        const mockFileSaverSaveAs = jest
            .spyOn(FileSaver, 'saveAs')
            .mockImplementation(() => {
                throw testError;
            });

        const [testFileName] = await setUpTestFile(saga);

        saga.put(fileStorageExportFile(testFileName));

        const action = await saga.take();
        expect(action).toEqual(fileStorageDidFailToExportFile(testFileName, testError));
        expect(mockFileSaverSaveAs).toHaveBeenCalled();

        await saga.end();

        mockFileSaverSaveAs.mockRestore();
    });
});

describe('archive', () => {
    it('should archive file with web file system api', async () => {
        const saga = new AsyncSaga(fileStorage);

        // window.showSaveFilePicker is not defined in the test environment
        // so we can't use spyOn().
        const mockWriteable = mock<FileSystemWritableFileStream>();
        const originalShowSaveFilePicker = window.showSaveFilePicker;
        window.showSaveFilePicker = jest.fn().mockResolvedValue(
            mock<FileSystemFileHandle>({
                createWritable: jest.fn().mockResolvedValue(mockWriteable),
            }),
        );

        await setUpTestFile(saga);

        saga.put(fileStorageArchiveAllFiles());

        const action = await saga.take();
        expect(action).toEqual(fileStorageDidArchiveAllFiles());
        expect(window.showSaveFilePicker).toHaveBeenCalled();
        expect(mockWriteable.write).toHaveBeenCalled();
        expect(mockWriteable.close).toHaveBeenCalled();

        await saga.end();

        window.showSaveFilePicker = originalShowSaveFilePicker;
    });

    it('should get error from web file system api', async () => {
        const saga = new AsyncSaga(fileStorage);

        // window.showSaveFilePicker is not defined in the test environment
        // so we can't use spyOn().
        const testError = new Error('test error');
        const originalShowSaveFilePicker = window.showSaveFilePicker;
        window.showSaveFilePicker = jest.fn().mockResolvedValue(
            mock<FileSystemFileHandle>({
                createWritable: jest.fn().mockRejectedValue(testError),
            }),
        );

        await setUpTestFile(saga);

        saga.put(fileStorageArchiveAllFiles());

        const action = await saga.take();
        expect(action).toEqual(fileStorageDidFailToArchiveAllFiles(testError));
        expect(window.showSaveFilePicker).toHaveBeenCalled();

        await saga.end();

        window.showSaveFilePicker = originalShowSaveFilePicker;
    });

    it('should export file using fallback', async () => {
        const saga = new AsyncSaga(fileStorage);

        const mockFileSaverSaveAs = jest.spyOn(FileSaver, 'saveAs');

        await setUpTestFile(saga);

        saga.put(fileStorageArchiveAllFiles());

        const action = await saga.take();
        expect(action).toEqual(fileStorageDidArchiveAllFiles());
        expect(mockFileSaverSaveAs).toHaveBeenCalled();

        await saga.end();

        mockFileSaverSaveAs.mockRestore();
    });

    it('should get error from fallback', async () => {
        const saga = new AsyncSaga(fileStorage);

        const testError = new Error('test error');
        const mockFileSaverSaveAs = jest
            .spyOn(FileSaver, 'saveAs')
            .mockImplementation(() => {
                throw testError;
            });

        await setUpTestFile(saga);

        saga.put(fileStorageArchiveAllFiles());

        const action = await saga.take();
        expect(action).toEqual(fileStorageDidFailToArchiveAllFiles(testError));
        expect(mockFileSaverSaveAs).toHaveBeenCalled();

        await saga.end();

        mockFileSaverSaveAs.mockRestore();
    });
});
