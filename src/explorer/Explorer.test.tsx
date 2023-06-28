// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { act, cleanup, waitFor } from '@testing-library/react';
import React from 'react';
import { testRender, uuid } from '../../test';
import { FileMetadata } from '../fileStorage';
import { useFileStorageMetadata } from '../fileStorage/hooks';
import Explorer from './Explorer';
import {
    explorerArchiveAllFiles,
    explorerCreateNewFile,
    explorerDeleteFile,
    explorerDuplicateFile,
    explorerExportFile,
    explorerImportFiles,
    explorerRenameFile,
    explorerUserActivateFile,
} from './actions';

afterEach(async () => {
    jest.restoreAllMocks();
    cleanup();
    localStorage.clear();
});

const testFile: FileMetadata = {
    uuid: uuid(0),
    path: 'test.file',
    sha256: '',
    viewState: null,
};

describe('archive button', () => {
    it('should dispatch action when clicked', async () => {
        jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
        const [user, explorer, dispatch] = testRender(<Explorer />);

        const button = explorer.getByTitle('Backup all files');
        expect(button).toBeEnabled();

        await act(() => user.click(button));
        expect(dispatch).toHaveBeenCalledWith(explorerArchiveAllFiles());
    });
});

describe('import file button', () => {
    it('should dispatch action when clicked', async () => {
        const [user, explorer, dispatch] = testRender(<Explorer />);

        const button = explorer.getByTitle('Import a file');

        await act(() => user.click(button));
        expect(dispatch).toHaveBeenCalledWith(explorerImportFiles());
    });
});

describe('new file button', () => {
    it('should dispatch action when clicked', async () => {
        const [user, explorer, dispatch] = testRender(<Explorer />);

        const button = explorer.getByTitle('Create a new file');

        await act(() => user.click(button));
        expect(dispatch).toHaveBeenCalledWith(explorerCreateNewFile());
    });
});

describe('tree item', () => {
    it('should dispatch action when clicked', async () => {
        jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
        const [user, explorer, dispatch] = testRender(<Explorer />);

        const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

        await act(() => user.click(treeItem));

        expect(dispatch).toHaveBeenCalledWith(
            explorerUserActivateFile('test.file', uuid(0)),
        );
    });

    it('should dispatch action when key is pressed', async () => {
        jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
        const [user, explorer, dispatch] = testRender(<Explorer />);

        const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

        await act(() => user.click(treeItem));
        await act(() => user.keyboard('{Enter}'));

        expect(dispatch).toHaveBeenCalledWith(
            explorerUserActivateFile('test.file', uuid(0)),
        );
    });

    describe('duplicate', () => {
        it('should dispatch action when button is clicked', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });
            await act(() => user.hover(treeItem));

            const button = await waitFor(() =>
                explorer.getByRole('button', { name: 'Duplicate test.file' }),
            );

            // user.click() has bad interaction with hover so we use user.pointer() instead
            await act(() => user.pointer({ keys: '[MouseLeft]', target: button }));

            expect(dispatch).toHaveBeenCalledWith(explorerDuplicateFile('test.file'));

            // should not propagate to treeitem
            expect(dispatch).toHaveBeenCalledTimes(1);
        });

        it('should dispatch action when key is pressed', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

            await act(() => user.click(treeItem));
            await act(() => user.keyboard('{Control>}d{/Control}'));

            expect(dispatch).toHaveBeenCalledWith(explorerDuplicateFile('test.file'));
        });
    });

    describe('rename', () => {
        it('should dispatch action when button is clicked', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });
            await act(() => user.hover(treeItem));

            const button = await waitFor(() =>
                explorer.getByRole('button', { name: 'Rename test.file' }),
            );

            // user.click() has bad interaction with hover so we use user.pointer() instead
            await act(() => user.pointer({ keys: '[MouseLeft]', target: button }));

            expect(dispatch).toHaveBeenCalledWith(explorerRenameFile('test.file'));

            // should not propagate to treeitem
            expect(dispatch).toHaveBeenCalledTimes(1);
        });

        it('should dispatch action when key is pressed', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

            await act(() => user.click(treeItem));
            await act(() => user.keyboard('{F2}'));

            expect(dispatch).toHaveBeenCalledWith(explorerRenameFile('test.file'));
        });
    });

    describe('export', () => {
        it('should dispatch export action when button is clicked', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });
            await act(() => user.hover(treeItem));

            const button = await waitFor(() =>
                explorer.getByRole('button', { name: 'Export test.file' }),
            );

            // user.click() has bad interaction with hover so we use user.pointer() instead
            await act(() => user.pointer({ keys: '[MouseLeft]', target: button }));

            expect(dispatch).toHaveBeenCalledWith(explorerExportFile('test.file'));

            // should not propagate to treeitem
            expect(dispatch).toHaveBeenCalledTimes(1);
        });

        it('should dispatch export action when key is pressed', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

            await act(() => user.click(treeItem));
            await act(() => user.keyboard('{Control>}e{/Control}'));

            expect(dispatch).toHaveBeenCalledWith(explorerExportFile('test.file'));
        });
    });

    describe('delete', () => {
        it('should dispatch delete action when button is clicked', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });
            await act(() => user.hover(treeItem));

            const button = await waitFor(() =>
                explorer.getByRole('button', { name: 'Delete test.file' }),
            );

            // user.click() has bad interaction with hover so we use user.pointer() instead
            await act(() => user.pointer({ keys: '[MouseLeft]', target: button }));

            expect(dispatch).toHaveBeenCalledWith(
                explorerDeleteFile('test.file', uuid(0)),
            );

            // should not propagate to treeitem
            expect(dispatch).toHaveBeenCalledTimes(1);
        });

        it('should dispatch delete action when key is pressed', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

            await act(() => user.click(treeItem));

            dispatch.mockClear();
            await act(() => user.keyboard('{Delete}'));

            expect(dispatch).toHaveBeenCalledWith(
                explorerDeleteFile('test.file', uuid(0)),
            );
        });
    });
});
