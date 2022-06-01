// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { Classes } from '@blueprintjs/core';
import { RenderResult, cleanup, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { monaco } from 'react-monaco-editor';
import { testRender, uuid } from '../../test';
import { FileMetadata } from '../fileStorage';
import { useFileStorageMetadata, useFileStoragePath } from '../fileStorage/hooks';
import { defined } from '../utils';
import Editor from './Editor';
import { editorActivateFile, editorCloseFile } from './actions';

const testFile: FileMetadata = {
    uuid: uuid(0),
    path: 'test.file',
    sha256: '',
    viewState: null,
};

describe('Editor', () => {
    describe('tabs', () => {
        it('should dispatch activate action when tab is clicked', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            jest.mocked(useFileStoragePath).mockReturnValue(testFile.path);

            const [editor, dispatch] = testRender(<Editor />, {
                editor: { openFileUuids: [testFile.uuid] },
            });

            userEvent.click(editor.getByRole('tab', { name: 'test.file' }));

            expect(dispatch).toHaveBeenCalledWith(editorActivateFile(testFile.uuid));
        });

        it.each(['enter', 'space'])(
            'should dispatch activate action when % button is pressed',
            async (button) => {
                jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
                jest.mocked(useFileStoragePath).mockReturnValue(testFile.path);

                const [editor, dispatch] = testRender(<Editor />, {
                    editor: { openFileUuids: [testFile.uuid] },
                });

                userEvent.type(
                    editor.getByRole('tab', { name: 'test.file' }),
                    `{${button}}`,
                );

                expect(dispatch).toHaveBeenCalledWith(
                    editorActivateFile(testFile.uuid),
                );
            },
        );

        it('should dispatch close action when close button is clicked', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            jest.mocked(useFileStoragePath).mockReturnValue(testFile.path);

            const [editor, dispatch] = testRender(<Editor />, {
                editor: { openFileUuids: [testFile.uuid] },
            });

            userEvent.click(editor.getByRole('button', { name: 'Close test.file' }));

            expect(dispatch).toHaveBeenCalledWith(editorCloseFile(testFile.uuid));
        });

        it('should dispatch close action when delete button is pressed', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            jest.mocked(useFileStoragePath).mockReturnValue(testFile.path);

            const [editor, dispatch] = testRender(<Editor />, {
                editor: { openFileUuids: [testFile.uuid] },
            });

            userEvent.type(editor.getByRole('tab', { name: 'test.file' }), '{delete}');

            expect(dispatch).toHaveBeenCalledWith(editorCloseFile(testFile.uuid));
        });
    });

    describe('context menu', () => {
        let editor: RenderResult;
        let code: monaco.editor.ICodeEditor;

        beforeEach(async () => {
            const didCreate = new Promise<monaco.editor.ICodeEditor>((resolve) =>
                monaco.editor.onDidCreateEditor(resolve),
            );

            [editor] = testRender(<Editor />);
            code = await didCreate;

            code.setModel(monaco.editor.createModel('test'));

            expect(
                editor.queryByRole('menu', { name: 'Editor context menu' }),
            ).toBeNull();
        });

        describe('keyboard interaction', () => {
            let contextMenu: HTMLElement;

            beforeEach(async () => {
                // HACK: monaco editor uses deprecated event fields (keyCode),
                // so regular userEvent.type() doesn't work. testing library
                // doesn't have ContextMenu in its keymap either.
                fireEvent(
                    editor.getByRole('textbox', { name: /^Editor content/ }),
                    new KeyboardEvent('keydown', {
                        key: 'ContextMenu',
                        code: 'ContextMenu',
                        keyCode: 93,
                    }),
                );

                contextMenu = await editor.findByRole('menu', {
                    name: 'Editor context menu',
                });

                expect(contextMenu).toBeInTheDocument();

                // a11y: first item in menu should be focused when menu opens
                await waitFor(() =>
                    expect(
                        editor.getByRole('menuitem', { name: 'Copy' }),
                    ).toHaveFocus(),
                );
            });

            it('should hide the context menu when Escape is pressed', async () => {
                userEvent.keyboard('{esc}');

                await waitFor(() => expect(contextMenu).not.toBeInTheDocument());

                // editor should be focused after context menu closes
                expect(
                    editor.getByRole('textbox', { name: /^Editor content/ }),
                ).toHaveFocus();
            });
        });

        describe('mouse interaction', () => {
            let contextMenu: HTMLElement;

            beforeEach(async () => {
                userEvent.click(
                    editor.getByRole('textbox', { name: /^Editor content/ }),
                    {
                        button: 2,
                    },
                );

                contextMenu = await editor.findByRole('menu', {
                    name: 'Editor context menu',
                });

                expect(contextMenu).toBeInTheDocument();

                // a11y: first item in menu should be focused when menu opens
                await waitFor(() =>
                    expect(
                        editor.getByRole('menuitem', { name: 'Copy' }),
                    ).toHaveFocus(),
                );
            });

            it('should hide the context menu when clicking away', async () => {
                const overlay = document
                    .getElementsByClassName(Classes.OVERLAY_BACKDROP)
                    .item(0);

                defined(overlay);

                userEvent.click(overlay);

                await waitFor(() => expect(contextMenu).not.toBeInTheDocument());

                // editor should be focused after context menu closes
                expect(
                    editor.getByRole('textbox', { name: /^Editor content/ }),
                ).toHaveFocus();
            });
        });
    });

    afterEach(() => {
        cleanup();
    });
});
