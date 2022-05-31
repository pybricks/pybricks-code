// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { mock } from 'jest-mock-extended';
import type { monaco } from 'react-monaco-editor';
import { uuid } from '../../test';
import { ActiveFileHistoryManager, OpenFileInfo, OpenFileManager } from './lib';

const testFileUuid = uuid(0);
const oneFileUuid = uuid(1);
const twoFileUuid = uuid(2);
const threeFileUuid = uuid(3);

afterEach(() => {
    sessionStorage.clear();
});

describe('ActiveFileHistoryManager', () => {
    it('should handle fresh (empty) storageSession', () => {
        const manager = new ActiveFileHistoryManager('test');
        expect([...manager.getFromStorage()]).toEqual([]);
    });

    it('should return history from sessionStorage', () => {
        sessionStorage.setItem(
            `editor.activeFileHistory.${window.name}.test`,
            `["${oneFileUuid}","${twoFileUuid}"]`,
        );

        const manager = new ActiveFileHistoryManager('test');
        expect([...manager.getFromStorage()]).toEqual([oneFileUuid, twoFileUuid]);
    });

    it('should save to sessionStorage', () => {
        const manager = new ActiveFileHistoryManager('test');

        manager.push(oneFileUuid);
        manager.push(twoFileUuid);

        expect(
            sessionStorage.getItem(`editor.activeFileHistory.${window.name}.test`),
        ).toEqual(`["${oneFileUuid}","${twoFileUuid}"]`);
    });

    it('should reorder existing files', () => {
        const manager = new ActiveFileHistoryManager('test');

        manager.push(oneFileUuid);
        manager.push(twoFileUuid);
        manager.push(oneFileUuid);

        expect(
            sessionStorage.getItem(`editor.activeFileHistory.${window.name}.test`),
        ).toEqual(`["${twoFileUuid}","${oneFileUuid}"]`);
    });

    it('should known when active file was popped', () => {
        const manager = new ActiveFileHistoryManager('test');

        manager.push(oneFileUuid);
        manager.push(twoFileUuid);

        expect(manager.pop(twoFileUuid)).toBe(oneFileUuid);

        expect(
            sessionStorage.getItem(`editor.activeFileHistory.${window.name}.test`),
        ).toEqual(`["${oneFileUuid}"]`);
    });

    it('should known when not active file was popped', () => {
        const manager = new ActiveFileHistoryManager('test');

        manager.push(oneFileUuid);
        manager.push(twoFileUuid);

        expect(manager.pop(oneFileUuid)).toBe(undefined);

        expect(
            sessionStorage.getItem(`editor.activeFileHistory.${window.name}.test`),
        ).toEqual(`["${twoFileUuid}"]`);
    });

    it('should known when never active file was popped', () => {
        const manager = new ActiveFileHistoryManager('test');

        manager.push(oneFileUuid);
        manager.push(twoFileUuid);

        expect(manager.pop(threeFileUuid)).toBe(undefined);

        expect(
            sessionStorage.getItem(`editor.activeFileHistory.${window.name}.test`),
        ).toEqual(`["${oneFileUuid}","${twoFileUuid}"]`);
    });
});

describe('OpenFileManager', () => {
    it('should add and remove files', () => {
        const manager = new OpenFileManager();

        expect(manager.has(testFileUuid)).toBeFalsy();
        expect(manager.get(testFileUuid)).toBeUndefined();

        const model = mock<monaco.editor.ITextModel>();

        manager.add(testFileUuid, model, null);

        expect(manager.has(testFileUuid)).toBeTruthy();
        expect(manager.get(testFileUuid)).toEqual(<OpenFileInfo>{
            model,
            viewState: null,
        });

        manager.remove(testFileUuid);

        expect(manager.has(testFileUuid)).toBeFalsy();
        expect(manager.get(testFileUuid)).toBeUndefined();
    });

    it('should update viewState', () => {
        const manager = new OpenFileManager();

        // does not fail if key does not exist
        manager.updateViewState(testFileUuid, null);

        const model = mock<monaco.editor.ITextModel>();
        const viewState = mock<monaco.editor.ICodeEditorViewState>();

        manager.add(testFileUuid, model, viewState);

        expect(manager.get(testFileUuid)).toHaveProperty('viewState', viewState);

        manager.updateViewState(testFileUuid, null);

        expect(manager.get(testFileUuid)).toHaveProperty('viewState', null);
    });
});
