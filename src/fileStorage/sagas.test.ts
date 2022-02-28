// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { AsyncSaga } from '../../test';
import {
    fileStorageDidChangeItem,
    fileStorageDidFailToReadFile,
    fileStorageDidInitialize,
    fileStorageDidReadFile,
    fileStorageDidWriteFile,
    fileStorageReadFile,
    fileStorageWriteFile,
} from './actions';
import fileStorage from './sagas';

beforeEach(() => {
    // localForge uses localStorage as backend in test environment, so we need
    // to start with a clean slate in each test
    localStorage.clear();
});

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
