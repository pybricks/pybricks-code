// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { uuid } from '../../test';
import {
    editorDidActivateFile,
    editorDidCloseFile,
    editorDidCreate,
    editorDidOpenFile,
} from './actions';
import reducers from './reducers';

type State = ReturnType<typeof reducers>;

const testUuid = uuid(0);

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
            reducers({ activeFileUuid: null } as State, editorDidActivateFile(testUuid))
                .activeFileUuid,
        ).toBe(testUuid);
    });
});

describe('openFiles', () => {
    it('should change state when a file is opened', () => {
        expect(
            reducers(
                { openFileUuids: [] as readonly string[] } as State,
                editorDidOpenFile(testUuid),
            ).openFileUuids,
        ).toEqual([testUuid]);
    });

    it('should change state when a file is closed', () => {
        expect(
            reducers(
                { openFileUuids: [testUuid] as readonly string[] } as State,
                editorDidCloseFile(testUuid),
            ).openFileUuids,
        ).toEqual([]);
    });
});
