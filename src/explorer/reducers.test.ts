// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { uuid } from '../../test';
import {
    FileMetadata,
    fileStorageDidAddItem,
    fileStorageDidChangeItem,
    fileStorageDidInitialize,
    fileStorageDidRemoveItem,
} from '../fileStorage/actions';
import reducers, { ExplorerFileInfo } from './reducers';

type State = ReturnType<typeof reducers>;

describe('files', () => {
    const testFile: ExplorerFileInfo = {
        id: uuid(0),
        name: 'test.file',
    };

    const testFileMetadata: FileMetadata = {
        uuid: uuid(0),
        path: 'test.file',
        sha256: '',
    };

    const modifiedFile: ExplorerFileInfo = {
        ...testFile,
        name: 'modified.file',
    };

    const modifiedFileMetadata: FileMetadata = {
        ...testFileMetadata,
        path: 'modified.file',
    };

    beforeAll(() => {
        // check validity of test data before starting tests
        expect(testFile).not.toEqual(modifiedFile);
        expect(testFileMetadata).not.toEqual(modifiedFileMetadata);
    });

    it('should get a list when file storage is initialized', () => {
        expect(
            reducers(
                { files: [] as readonly ExplorerFileInfo[] } as State,
                fileStorageDidInitialize([testFileMetadata]),
            ).files,
        ).toEqual([testFile]);
    });

    it('should modify the list when a file is added to storage', () => {
        expect(
            reducers(
                { files: [] as readonly ExplorerFileInfo[] } as State,
                fileStorageDidAddItem(testFileMetadata),
            ).files,
        ).toEqual([testFile]);
    });

    it('should modify the list when an item is renamed in storage', () => {
        expect(
            reducers(
                { files: [testFile] as readonly ExplorerFileInfo[] } as State,
                fileStorageDidChangeItem(testFileMetadata, modifiedFileMetadata),
            ).files,
        ).toEqual([modifiedFile]);
    });

    it('should not modify the list if a change is made other than renaming', () => {
        const originalList: readonly ExplorerFileInfo[] = [testFile];
        expect(
            reducers(
                { files: originalList } as State,
                fileStorageDidChangeItem(testFileMetadata, {
                    ...testFileMetadata,
                    sha256: 'changed',
                }),
            ).files,
        ).toBe(originalList);
    });

    it('should modify the list when a file is removed from storage', () => {
        expect(
            reducers(
                { files: [testFile] as readonly ExplorerFileInfo[] } as State,
                fileStorageDidRemoveItem(testFileMetadata),
            ).files,
        ).not.toContain(testFile);
    });
});
