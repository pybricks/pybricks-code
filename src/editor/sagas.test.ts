// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { mock } from 'jest-mock-extended';
import * as monaco from 'monaco-editor';
import { AsyncSaga, uuid } from '../../test';
import {
    fileStorageDidFailToLoadTextFile,
    fileStorageDidInitialize,
    fileStorageDidLoadTextFile,
    fileStorageLoadTextFile,
    fileStorageStoreTextFileValue,
} from '../fileStorage/actions';
import { acquireLock } from '../utils';
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
import { EditorError, EditorErrorName } from './error';
import { ActiveFileHistoryManager, OpenFileInfo, OpenFileManager } from './lib';
import editor from './sagas';

jest.mock('./lib');

const testFileUuid = uuid(0);
const newTestFileUuid = uuid(1);

afterEach(() => {
    jest.resetAllMocks();
    sessionStorage.clear();
});

it('should activate files from storage', async () => {
    jest.spyOn(
        ActiveFileHistoryManager.prototype,
        'getFromStorage',
    ).mockReturnValueOnce([testFileUuid].values());

    const saga = new AsyncSaga(editor);

    monaco.editor.create(document.createElement('div'));

    saga.put(fileStorageDidInitialize([]));

    await expect(saga.take()).resolves.toEqual(editorDidCreate());

    // other editor actions on create should take place after editorDidCreate()
    await expect(saga.take()).resolves.toEqual(editorActivateFile(testFileUuid));

    await saga.end();
});

/**
 * Asymmetric matcher for matching errors by name while ignoring the message.
 * @param name The name to match.
 * @returns An asymmetric matcher cast to an EditorError so that it can be
 * passed to action functions.
 */
function expectEditorError(name: EditorErrorName): EditorError {
    const matcher: jest.AsymmetricMatcher & Record<string, unknown> = {
        $$typeof: Symbol.for('jest.asymmetricMatcher'),
        asymmetricMatch: (other) => other instanceof EditorError && other.name === name,
        toAsymmetricMatcher: () => `[EditorError: ${name}]`,
    };

    return matcher as unknown as EditorError;
}

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
        it('should fail if file is already in use', async () => {
            const releaseLock = await acquireLock(
                `pybricks.editor+pybricksCode:${testFileUuid}`,
            );
            expect(releaseLock).toBeDefined();

            try {
                saga.put(editorOpenFile(testFileUuid));

                await expect(saga.take()).resolves.toEqual(
                    editorDidFailToOpenFile(
                        testFileUuid,
                        expectEditorError('FileInUse'),
                    ),
                );
            } finally {
                await releaseLock?.();
            }
        });

        describe('not already in use', () => {
            beforeEach(async () => {
                jest.spyOn(OpenFileManager.prototype, 'add');
                jest.spyOn(OpenFileManager.prototype, 'remove');
                saga.put(editorOpenFile(testFileUuid));

                await expect(saga.take()).resolves.toEqual(
                    fileStorageLoadTextFile(testFileUuid),
                );
            });

            it('should propagate error from fileStorageLoadTextFile', async () => {
                const testError = new Error('test error');

                saga.put(fileStorageDidFailToLoadTextFile(testFileUuid, testError));

                await expect(saga.take()).resolves.toEqual(
                    editorDidFailToOpenFile(testFileUuid, testError),
                );

                expect(OpenFileManager.prototype.add).not.toHaveBeenCalled();
            });

            describe('read succeeded', () => {
                let model: monaco.editor.ITextModel;

                beforeEach(async () => {
                    monaco.editor.onDidCreateModel((m) => (model = m));

                    saga.put(fileStorageDidLoadTextFile(testFileUuid, '', null));

                    expect(model).toBeDefined();

                    await expect(saga.take()).resolves.toEqual(
                        editorDidOpenFile(testFileUuid),
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

                    saga.put(editorCloseFile(testFileUuid));

                    // file is saved on close
                    await expect(saga.take()).resolves.toEqual(
                        fileStorageStoreTextFileValue(testFileUuid, ''),
                    );

                    // model should be disposed before fileStorageClose
                    expect(model.dispose).toHaveBeenCalled();
                    expect(OpenFileManager.prototype.remove).toHaveBeenCalled();

                    await expect(saga.take()).resolves.toEqual(
                        editorDidCloseFile(testFileUuid),
                    );
                });
            });
        });
    });

    describe('handleEditorActivateFile', () => {
        describe('file is not already open', () => {
            beforeEach(async () => {
                jest.spyOn(OpenFileManager.prototype, 'has').mockReturnValueOnce(false);
                saga.put(editorActivateFile(testFileUuid));
                await expect(saga.take()).resolves.toEqual(
                    editorOpenFile(testFileUuid),
                );
            });

            it('should propagate error if open fails', async () => {
                const testError = new Error('test error');
                saga.put(editorDidFailToOpenFile(testFileUuid, testError));

                await expect(saga.take()).resolves.toEqual(
                    editorDidFailToActivateFile(testFileUuid, testError),
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

                saga.put(editorDidOpenFile(testFileUuid));

                // changes should be made before editorDidActivateFile
                expect(
                    OpenFileManager.prototype.updateViewState,
                ).not.toHaveBeenCalled();
                expect(monacoEditor.setModel).toHaveBeenCalled();
                expect(monacoEditor.restoreViewState).toHaveBeenCalled();
                expect(ActiveFileHistoryManager.prototype.push).toHaveBeenCalled();

                await expect(saga.take()).resolves.toEqual(
                    editorDidActivateFile(testFileUuid),
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
                saga.put(editorActivateFile(testFileUuid));
            });

            it('should set the model and update sessionStorage', async () => {
                // changes should be made before editorDidActivateFile
                expect(monacoEditor.setModel).toHaveBeenCalled();
                expect(monacoEditor.restoreViewState).toHaveBeenCalled();
                expect(
                    OpenFileManager.prototype.updateViewState,
                ).not.toHaveBeenCalled();

                await expect(saga.take()).resolves.toEqual(
                    editorDidActivateFile(testFileUuid),
                );
            });
        });
    });

    describe('handleEditorDidCloseFile', () => {
        it('should activate a new file if closed file was currently active', async () => {
            jest.spyOn(ActiveFileHistoryManager.prototype, 'pop').mockReturnValueOnce(
                newTestFileUuid,
            );

            saga.put(editorDidCloseFile(testFileUuid));

            expect(ActiveFileHistoryManager.prototype.pop).toHaveBeenCalled();
            await expect(saga.take()).resolves.toEqual(
                editorActivateFile(newTestFileUuid),
            );
        });

        it('should do nothing if closed file was not currently active', async () => {
            jest.spyOn(ActiveFileHistoryManager.prototype, 'pop').mockReturnValueOnce(
                undefined,
            );

            saga.put(editorDidCloseFile(testFileUuid));

            expect(ActiveFileHistoryManager.prototype.pop).toHaveBeenCalled();
        });
    });

    afterEach(async () => {
        await saga.end();
    });
});
