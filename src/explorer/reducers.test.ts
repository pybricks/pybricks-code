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
import reducers from './reducers';

type State = ReturnType<typeof reducers>;

test('files', () => {
    const testFile: FileMetadata = {
        uuid: uuid(0),
        path: 'test.file',
        sha256: '',
    };

    const modifiedFile: FileMetadata = { ...testFile, path: 'modified.file' };

    expect(testFile).not.toEqual(modifiedFile);

    // initialization populates file list
    expect(
        reducers(
            { files: [] as readonly FileMetadata[] } as State,
            fileStorageDidInitialize([testFile]),
        ).files,
    ).toEqual([testFile]);

    // adding appends an item
    expect(
        reducers(
            { files: [] as readonly FileMetadata[] } as State,
            fileStorageDidAddItem(testFile),
        ).files,
    ).toEqual([testFile]);

    // changing replaces an item
    expect(
        reducers(
            { files: [testFile] as readonly FileMetadata[] } as State,
            fileStorageDidChangeItem(testFile, modifiedFile),
        ).files,
    ).toEqual([modifiedFile]);

    // removing deletes an item
    expect(
        reducers(
            { files: [testFile] as readonly FileMetadata[] } as State,
            fileStorageDidRemoveItem(testFile),
        ).files,
    ).not.toContain(testFile);
});
