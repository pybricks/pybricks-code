// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { mock } from 'jest-mock-extended';
import { monaco } from 'react-monaco-editor';
import { FD } from '../fileStorage/actions';
import { ActiveFileHistoryManager, OpenFileInfo, OpenFileManager } from './lib';

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
            '["one.file","two.file"]',
        );

        const manager = new ActiveFileHistoryManager('test');
        expect([...manager.getFromStorage()]).toEqual(['one.file', 'two.file']);
    });

    it('should save to sessionStorage', () => {
        const manager = new ActiveFileHistoryManager('test');

        manager.push('one.file');
        manager.push('two.file');

        expect(
            sessionStorage.getItem(`editor.activeFileHistory.${window.name}.test`),
        ).toEqual('["one.file","two.file"]');
    });

    it('should reorder existing files', () => {
        const manager = new ActiveFileHistoryManager('test');

        manager.push('one.file');
        manager.push('two.file');
        manager.push('one.file');

        expect(
            sessionStorage.getItem(`editor.activeFileHistory.${window.name}.test`),
        ).toEqual('["two.file","one.file"]');
    });

    it('should known when active file was popped', () => {
        const manager = new ActiveFileHistoryManager('test');

        manager.push('one.file');
        manager.push('two.file');

        expect(manager.pop('two.file')).toBe('one.file');

        expect(
            sessionStorage.getItem(`editor.activeFileHistory.${window.name}.test`),
        ).toEqual('["one.file"]');
    });

    it('should known when not active file was popped', () => {
        const manager = new ActiveFileHistoryManager('test');

        manager.push('one.file');
        manager.push('two.file');

        expect(manager.pop('one.file')).toBe(undefined);

        expect(
            sessionStorage.getItem(`editor.activeFileHistory.${window.name}.test`),
        ).toEqual('["two.file"]');
    });

    it('should known when never active file was popped', () => {
        const manager = new ActiveFileHistoryManager('test');

        manager.push('one.file');
        manager.push('two.file');

        expect(manager.pop('three.file')).toBe(undefined);

        expect(
            sessionStorage.getItem(`editor.activeFileHistory.${window.name}.test`),
        ).toEqual('["one.file","two.file"]');
    });
});

describe('OpenFileManager', () => {
    it('should add and remove files', () => {
        const manager = new OpenFileManager();

        expect(manager.has('test.file')).toBeFalsy();
        expect(manager.get('test.file')).toBeUndefined();

        const model = mock<monaco.editor.ITextModel>();

        manager.add('test.file', 0 as FD, model, null);

        expect(manager.has('test.file')).toBeTruthy();
        expect(manager.get('test.file')).toEqual(<OpenFileInfo>{
            fd: 0 as FD,
            model,
            viewState: null,
        });

        manager.remove('test.file');

        expect(manager.has('test.file')).toBeFalsy();
        expect(manager.get('test.file')).toBeUndefined();
    });

    it('should update viewState', () => {
        const manager = new OpenFileManager();

        // does not fail if key does not exist
        manager.updateViewState('test.file', null);

        const model = mock<monaco.editor.ITextModel>();
        const viewState = mock<monaco.editor.ICodeEditorViewState>();

        manager.add('test.file', 0 as FD, model, viewState);

        expect(manager.get('test.file')).toHaveProperty('viewState', viewState);

        manager.updateViewState('test.file', null);

        expect(manager.get('test.file')).toHaveProperty('viewState', null);
    });
});
