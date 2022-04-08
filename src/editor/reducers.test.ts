// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import {
    editorDidActivateFile,
    editorDidCloseFile,
    editorDidCreate,
    editorDidOpenFile,
} from './actions';
import reducers from './reducers';

type State = ReturnType<typeof reducers>;

describe('isReady', () => {
    it('should change state when editor is created', () => {
        expect(
            reducers({ isReady: false } as State, editorDidCreate()).isReady,
        ).toBeTruthy();
    });
});

describe('activeFile', () => {
    it('should change state when a file is activated', () => {
        expect(
            reducers({ activeFile: '' } as State, editorDidActivateFile('test.file'))
                .activeFile,
        ).toBe('test.file');
    });
});

describe('openFiles', () => {
    it('should change state when a file is opened', () => {
        expect(
            reducers(
                { openFiles: [] as readonly string[] } as State,
                editorDidOpenFile('test.file'),
            ).openFiles,
        ).toEqual(['test.file']);
    });

    it('should change state when a file is closed', () => {
        expect(
            reducers(
                { openFiles: ['test.file'] as readonly string[] } as State,
                editorDidCloseFile('test.file'),
            ).openFiles,
        ).toEqual([]);
    });
});
