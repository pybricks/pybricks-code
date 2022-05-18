// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { mock } from 'jest-mock-extended';
import { monaco } from 'react-monaco-editor';
import { AsyncSaga } from '../../test';
import {
    fileStorageDidFailToReadFile,
    fileStorageDidInitialize,
    fileStorageDidReadFile,
    fileStorageReadFile,
} from '../fileStorage/actions';
import {
    editorActivateFile,
    editorCloseFile,
    editorDidActivateFile,
    editorDidCloseFile,
    editorDidCreate,
    editorDidFailToActivateFile,
    editorDidFailToOpenFile,
    editorDidOpenFile,
    editorOpenFile,
} from './actions';
import { ActiveFileHistoryManager, OpenFileInfo, OpenFileManager } from './lib';
import editor from './sagas';

jest.mock('./lib');

afterEach(() => {
    jest.resetAllMocks();
    sessionStorage.clear();
});

it('should activate files from storage', async () => {
    jest.spyOn(
        ActiveFileHistoryManager.prototype,
        'getFromStorage',
    ).mockReturnValueOnce(['test.file'].values());

    const saga = new AsyncSaga(editor);

    monaco.editor.create(document.createElement('div'));

    saga.put(fileStorageDidInitialize([]));

    await expect(saga.take()).resolves.toEqual(editorDidCreate());

    // other editor actions on create should take place after editorDidCreate()
    await expect(saga.take()).resolves.toEqual(editorActivateFile('test.file'));

    await saga.end();
});

describe('per-editor sagas', () => {
    let saga: AsyncSaga;
    let monacoEditor: monaco.editor.IStandaloneCodeEditor;

    beforeEach(async () => {
        jest.spyOn(
            ActiveFileHistoryManager.prototype,
            'getFromStorage',
        ).mockReturnValueOnce([].values());

        saga = new AsyncSaga(editor);
        saga.updateState({ fileStorage: { isInitialized: true } });

        monacoEditor = monaco.editor.create(document.createElement('div'));

        await expect(saga.take()).resolves.toEqual(editorDidCreate());
    });

    describe('handleEditorOpenFile', () => {
        beforeEach(async () => {
            jest.spyOn(OpenFileManager.prototype, 'add');
            jest.spyOn(OpenFileManager.prototype, 'remove');
            saga.put(editorOpenFile('test.file'));

            await expect(saga.take()).resolves.toEqual(
                fileStorageReadFile('test.file'),
            );
        });

        it('should propagate error from fileStorageReadFile', async () => {
            const testError = new Error('test error');

            saga.put(fileStorageDidFailToReadFile('test.file', testError));

            await expect(saga.take()).resolves.toEqual(
                editorDidFailToOpenFile('test.file', testError),
            );

            expect(OpenFileManager.prototype.add).not.toHaveBeenCalled();
        });

        describe('read succeeded', () => {
            let model: monaco.editor.ITextModel;

            beforeEach(async () => {
                monaco.editor.onDidCreateModel((m) => (model = m));

                saga.put(fileStorageDidReadFile('test.file', ''));

                expect(model).toBeDefined();

                await expect(saga.take()).resolves.toEqual(
                    editorDidOpenFile('test.file'),
                );

                expect(OpenFileManager.prototype.add).toHaveBeenCalled();
                expect(OpenFileManager.prototype.remove).not.toHaveBeenCalled();
            });

            it('should close file if task is canceled', async () => {
                jest.spyOn(model, 'dispose');

                saga.cancel();

                // model should be disposed before fileStorageClose
                expect(model.dispose).toHaveBeenCalled();
                expect(OpenFileManager.prototype.remove).toHaveBeenCalled();

                // editorDidCloseFile is not called since we did not put editorCloseFile
            });

            it('should close when requested', async () => {
                jest.spyOn(model, 'dispose');

                saga.put(editorCloseFile('test.file'));

                // model should be disposed before fileStorageClose
                expect(model.dispose).toHaveBeenCalled();
                expect(OpenFileManager.prototype.remove).toHaveBeenCalled();

                await expect(saga.take()).resolves.toEqual(
                    editorDidCloseFile('test.file'),
                );
            });
        });
    });

    describe('handleEditorActivateFile', () => {
        describe('file is not already open', () => {
            beforeEach(async () => {
                jest.spyOn(OpenFileManager.prototype, 'has').mockReturnValueOnce(false);
                saga.put(editorActivateFile('test.file'));
                await expect(saga.take()).resolves.toEqual(editorOpenFile('test.file'));
            });

            it('should propagate error if open fails', async () => {
                const testError = new Error('test error');
                saga.put(editorDidFailToOpenFile('test.file', testError));

                await expect(saga.take()).resolves.toEqual(
                    editorDidFailToActivateFile('test.file', testError),
                );
            });

            it('should complete if open succeeds', async () => {
                jest.spyOn(monacoEditor, 'getModel').mockReturnValueOnce(null);
                jest.spyOn(monacoEditor, 'setModel').mockReturnValueOnce();
                jest.spyOn(monacoEditor, 'restoreViewState').mockReturnValueOnce();
                jest.spyOn(ActiveFileHistoryManager.prototype, 'push');
                jest.spyOn(OpenFileManager.prototype, 'get').mockReturnValueOnce(
                    mock<OpenFileInfo>(),
                );
                jest.spyOn(OpenFileManager.prototype, 'updateViewState');

                saga.put(editorDidOpenFile('test.file'));

                // changes should be made before editorDidActivateFile
                expect(OpenFileManager.prototype.updateViewState).toHaveBeenCalled();
                expect(monacoEditor.setModel).toHaveBeenCalled();
                expect(monacoEditor.restoreViewState).toHaveBeenCalled();
                expect(ActiveFileHistoryManager.prototype.push).toHaveBeenCalled();

                await expect(saga.take()).resolves.toEqual(
                    editorDidActivateFile('test.file'),
                );
            });
        });

        describe('file is already open', () => {
            beforeEach(async () => {
                jest.spyOn(OpenFileManager.prototype, 'has').mockReturnValueOnce(true);
                jest.spyOn(OpenFileManager.prototype, 'get').mockReturnValueOnce(
                    mock<OpenFileInfo>(),
                );
                jest.spyOn(OpenFileManager.prototype, 'updateViewState');
                jest.spyOn(monacoEditor, 'getModel').mockReturnValueOnce(null);
                jest.spyOn(monacoEditor, 'setModel').mockReturnValueOnce();
                jest.spyOn(monacoEditor, 'restoreViewState').mockReturnValueOnce();
                saga.put(editorActivateFile('test.file'));
            });

            it('should set the model and update sessionStorage', async () => {
                // changes should be made before editorDidActivateFile
                expect(monacoEditor.setModel).toHaveBeenCalled();
                expect(monacoEditor.restoreViewState).toHaveBeenCalled();
                expect(OpenFileManager.prototype.updateViewState).toHaveBeenCalled();

                await expect(saga.take()).resolves.toEqual(
                    editorDidActivateFile('test.file'),
                );
            });
        });
    });

    describe('handleEditorDidCloseFile', () => {
        it('should activate a new file if closed file was currently active', async () => {
            jest.spyOn(ActiveFileHistoryManager.prototype, 'pop').mockReturnValueOnce(
                'new.file',
            );

            saga.put(editorDidCloseFile('test.file'));

            expect(ActiveFileHistoryManager.prototype.pop).toHaveBeenCalled();
            await expect(saga.take()).resolves.toEqual(editorActivateFile('new.file'));
        });

        it('should do nothing if closed file was not currently active', () => {
            jest.spyOn(ActiveFileHistoryManager.prototype, 'pop').mockReturnValueOnce(
                undefined,
            );

            saga.put(editorDidCloseFile('test.file'));

            expect(ActiveFileHistoryManager.prototype.pop).toHaveBeenCalled();
        });
    });

    afterEach(async () => {
        await saga.end();
    });
});
