// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { Classes } from '@blueprintjs/core';
import { cleanup, fireEvent, waitFor } from '@testing-library/react';
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
jest.setTimeout(1000000);
afterEach(() => {
    cleanup();
});

describe('Editor', () => {
    describe('tabs', () => {
        it('should dispatch activate action when tab is clicked', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            jest.mocked(useFileStoragePath).mockReturnValue(testFile.path);

            const [user, editor, dispatch] = testRender(<Editor />, {
                editor: { openFileUuids: [testFile.uuid] },
            });

            await user.click(editor.getByRole('tab', { name: 'test.file' }));

            expect(dispatch).toHaveBeenCalledWith(editorActivateFile(testFile.uuid));
        });

        it.each(['{Enter}', '{Space}'])(
            'should dispatch activate action when %s key is pressed',
            async (key) => {
                jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
                jest.mocked(useFileStoragePath).mockReturnValue(testFile.path);

                const [user, editor, dispatch] = testRender(<Editor />, {
                    editor: { openFileUuids: [testFile.uuid] },
                });

                await user.type(editor.getByRole('tab', { name: 'test.file' }), key);

                expect(dispatch).toHaveBeenCalledWith(
                    editorActivateFile(testFile.uuid),
                );
            },
        );

        it('should dispatch close action when close button is clicked', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            jest.mocked(useFileStoragePath).mockReturnValue(testFile.path);

            const [user, editor, dispatch] = testRender(<Editor />, {
                editor: { openFileUuids: [testFile.uuid] },
            });

            await user.click(editor.getByRole('button', { name: 'Close test.file' }));

            expect(dispatch).toHaveBeenCalledWith(editorCloseFile(testFile.uuid));
        });

        it('should dispatch close action when delete button is pressed', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            jest.mocked(useFileStoragePath).mockReturnValue(testFile.path);

            const [user, editor, dispatch] = testRender(<Editor />, {
                editor: { openFileUuids: [testFile.uuid] },
            });

            await user.type(editor.getByRole('tab', { name: 'test.file' }), '{Delete}');

            expect(dispatch).toHaveBeenCalledWith(editorCloseFile(testFile.uuid));
        });

        it('should dispatch close action when tab is middle clicked', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            jest.mocked(useFileStoragePath).mockReturnValue(testFile.path);

            const [user, editor, dispatch] = testRender(<Editor />, {
                editor: { openFileUuids: [testFile.uuid] },
            });

            await user.pointer({
                keys: '[MouseMiddle]',
                target: editor.getByRole('tab', { name: 'test.file' }),
            });

            expect(dispatch).toHaveBeenCalledWith(editorCloseFile(testFile.uuid));
        });
    });

    describe('context menu', () => {
        it('should hide the context menu when Escape is pressed', async () => {
            const didCreate = new Promise<monaco.editor.ICodeEditor>((resolve) =>
                monaco.editor.onDidCreateEditor(resolve),
            );

            const [user, editor] = testRender(<Editor />);
            const code = await didCreate;

            code.setModel(monaco.editor.createModel('test'));

            expect(
                editor.queryByRole('menu', { name: 'Editor context menu' }),
            ).toBeNull();

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

            const contextMenu = await editor.findByRole('menu', {
                name: 'Editor context menu',
            });

            expect(contextMenu).toBeInTheDocument();

            // a11y: first item in menu should be focused when menu opens
            await waitFor(() =>
                expect(editor.getByRole('menuitem', { name: 'Copy' })).toHaveFocus(),
            );

            await user.keyboard('{Escape}');

            await waitFor(() => expect(contextMenu).not.toBeInTheDocument());

            // editor should be focused after context menu closes
            expect(
                editor.getByRole('textbox', { name: /^Editor content/ }),
            ).toHaveFocus();
        });

        it('should hide the context menu when clicking away', async () => {
            const didCreate = new Promise<monaco.editor.ICodeEditor>((resolve) =>
                monaco.editor.onDidCreateEditor(resolve),
            );

            const [user, editor] = testRender(<Editor />);
            const code = await didCreate;

            code.setModel(monaco.editor.createModel('test'));

            expect(
                editor.queryByRole('menu', { name: 'Editor context menu' }),
            ).toBeNull();

            await user.pointer({
                keys: '[MouseRight]',
                target: editor.getByRole('textbox', { name: /^Editor content/ }),
            });

            const contextMenu = await editor.findByRole('menu', {
                name: 'Editor context menu',
            });

            expect(contextMenu).toBeInTheDocument();

            // a11y: first item in menu should be focused when menu opens
            await waitFor(() =>
                expect(editor.getByRole('menuitem', { name: 'Copy' })).toHaveFocus(),
            );
            const overlay = document
                .getElementsByClassName(Classes.OVERLAY_BACKDROP)
                .item(0);

            defined(overlay);

            await user.click(overlay);

            await waitFor(() => expect(contextMenu).not.toBeInTheDocument());

            // editor should be focused after context menu closes
            expect(
                editor.getByRole('textbox', { name: /^Editor content/ }),
            ).toHaveFocus();
        });
    });
});
