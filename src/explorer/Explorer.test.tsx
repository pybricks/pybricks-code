// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup } from '@testing-library/react';
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

        await user.click(button);
        expect(dispatch).toHaveBeenCalledWith(explorerArchiveAllFiles());
    });
});

describe('import file button', () => {
    it('should dispatch action when clicked', async () => {
        const [user, explorer, dispatch] = testRender(<Explorer />);

        const button = explorer.getByTitle('Import a file');

        await user.click(button);
        expect(dispatch).toHaveBeenCalledWith(explorerImportFiles());
    });
});

describe('new file button', () => {
    it('should dispatch action when clicked', async () => {
        const [user, explorer, dispatch] = testRender(<Explorer />);

        const button = explorer.getByTitle('Create a new file');

        await user.click(button);
        expect(dispatch).toHaveBeenCalledWith(explorerCreateNewFile());
    });
});

describe('tree item', () => {
    it('should dispatch action when clicked', async () => {
        jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
        const [user, explorer, dispatch] = testRender(<Explorer />);

        const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

        await user.click(treeItem);

        expect(dispatch).toHaveBeenCalledWith(
            explorerUserActivateFile('test.file', uuid(0)),
        );
    });

    it('should dispatch action when key is pressed', async () => {
        jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
        const [user, explorer, dispatch] = testRender(<Explorer />);

        const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

        await user.click(treeItem);
        await user.keyboard('{Enter}');

        expect(dispatch).toHaveBeenCalledWith(
            explorerUserActivateFile('test.file', uuid(0)),
        );
    });

    describe('duplicate', () => {
        it('should dispatch action when button is clicked', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            // NB: this button is intentionally not accessible (by role) since
            // there is a keyboard shortcut.
            const button = explorer.getByTitle('Duplicate test.file');

            await user.click(button);

            expect(dispatch).toHaveBeenCalledWith(explorerDuplicateFile('test.file'));

            // should not propagate to treeitem
            expect(dispatch).toHaveBeenCalledTimes(1);
        });

        it('should dispatch action when key is pressed', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

            await user.click(treeItem);
            await user.keyboard('{Control>}d{/Control}');

            expect(dispatch).toHaveBeenCalledWith(explorerDuplicateFile('test.file'));
        });
    });

    describe('rename', () => {
        it('should dispatch action when button is clicked', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            // NB: this button is intentionally not accessible (by role) since
            // there is a keyboard shortcut.
            const button = explorer.getByTitle('Rename test.file');

            await user.click(button);

            expect(dispatch).toHaveBeenCalledWith(explorerRenameFile('test.file'));

            // should not propagate to treeitem
            expect(dispatch).toHaveBeenCalledTimes(1);
        });

        it('should dispatch action when key is pressed', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

            await user.click(treeItem);
            await user.keyboard('{F2}');

            expect(dispatch).toHaveBeenCalledWith(explorerRenameFile('test.file'));
        });
    });

    describe('export', () => {
        it('should dispatch export action when button is clicked', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            // NB: this button is intentionally not accessible (by role) since
            // there is a keyboard shortcut.
            const button = explorer.getByTitle('Export test.file');

            await user.click(button);

            expect(dispatch).toHaveBeenCalledWith(explorerExportFile('test.file'));

            // should not propagate to treeitem
            expect(dispatch).toHaveBeenCalledTimes(1);
        });

        it('should dispatch export action when key is pressed', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

            await user.click(treeItem);
            await user.keyboard('{Control>}e{/Control}');

            expect(dispatch).toHaveBeenCalledWith(explorerExportFile('test.file'));
        });
    });

    describe('delete', () => {
        it('should dispatch delete action when button is clicked', async () => {
            jest.mocked(useFileStorageMetadata).mockReturnValue([testFile]);
            const [user, explorer, dispatch] = testRender(<Explorer />);

            // NB: this button is intentionally not accessible (by role) since
            // there is a keyboard shortcut.
            const button = explorer.getByTitle('Delete test.file');

            await user.click(button);

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

            await user.click(treeItem);
            await user.keyboard('{Delete}');

            expect(dispatch).toHaveBeenCalledWith(
                explorerDeleteFile('test.file', uuid(0)),
            );
        });
    });
});
