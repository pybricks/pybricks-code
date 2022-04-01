// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { getByLabelText, waitFor } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender, uuid } from '../../test';
import {
    FileMetadata,
    fileStorageArchiveAllFiles,
    fileStorageExportFile,
} from '../fileStorage/actions';
import Explorer from './Explorer';
import { explorerDeleteFile, explorerImportFiles, explorerRenameFile } from './actions';

afterEach(async () => {
    cleanup();
    jest.clearAllMocks();
    localStorage.clear();
});

const testFile: FileMetadata = {
    uuid: uuid(0),
    path: 'test.file',
    sha256: '',
};

describe('archive button', () => {
    it('should be enabled if there are files', () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            fileStorage: { files: [testFile] },
        });

        const button = explorer.getByTitle('Backup all files');
        expect(button).toBeEnabled();

        userEvent.click(button);
        expect(dispatch).toHaveBeenCalledWith(fileStorageArchiveAllFiles());
    });

    it('should be disabled if there are no files', () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            fileStorage: { files: [] },
        });

        const button = explorer.getByTitle('Backup all files');
        expect(button).toBeDisabled();

        userEvent.click(button);
        expect(dispatch).not.toHaveBeenCalled();
    });
});

describe('import file button', () => {
    it('should dispatch action when clicked', async () => {
        const [explorer, dispatch] = testRender(<Explorer />);

        const button = explorer.getByTitle('Import a file');

        userEvent.click(button);
        expect(dispatch).toHaveBeenCalledWith(explorerImportFiles());
    });
});

describe('new file button', () => {
    it('should show new file wizard', async () => {
        const [explorer] = testRender(<Explorer />);

        const button = explorer.getByTitle('Create a new file');

        userEvent.click(button);

        const dialog = explorer.getByRole('dialog', { name: 'Create a new file' });
        expect(dialog).toBeVisible();

        userEvent.click(getByLabelText(dialog, 'Close'));
        await waitFor(() => expect(dialog).not.toBeVisible());
    });
});

describe('tree item', () => {
    it('should dispatch action when button is clicked', async () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            fileStorage: { files: [testFile] },
        });

        expect(
            explorer.queryByRole('dialog', { name: "Rename 'test.file'" }),
        ).toBeNull();

        // NB: this button is intentionally not accessible (by role) since
        // there is a keyboard shortcut.
        const button = explorer.getByTitle('Rename test.file');

        userEvent.click(button);

        expect(dispatch).toHaveBeenCalledWith(explorerRenameFile('test.file'));
    });

    it('should dispatch action when key is pressed', async () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            fileStorage: { files: [testFile] },
        });

        expect(
            explorer.queryByRole('dialog', { name: "Rename 'test.file'" }),
        ).toBeNull();

        const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

        userEvent.click(treeItem);
        userEvent.keyboard('{f2}');

        expect(dispatch).toHaveBeenCalledWith(explorerRenameFile('test.file'));
    });

    it('should dispatch delete action when button is clicked', async () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            fileStorage: { files: [testFile] },
        });

        // NB: this button is intentionally not accessible (by role) since
        // there is a keyboard shortcut.
        const button = explorer.getByTitle('Delete test.file');

        userEvent.click(button);

        expect(dispatch).toHaveBeenCalledWith(explorerDeleteFile('test.file'));
    });

    it('should dispatch delete action when key is pressed', async () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            fileStorage: { files: [testFile] },
        });

        const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

        userEvent.click(treeItem);
        userEvent.keyboard('{del}');

        expect(dispatch).toHaveBeenCalledWith(explorerDeleteFile('test.file'));
    });

    it('should dispatch export action when button is clicked', async () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            fileStorage: { files: [testFile] },
        });

        // NB: this button is intentionally not accessible (by role) since
        // there is a keyboard shortcut.
        const button = explorer.getByTitle('Export test.file');

        userEvent.click(button);

        expect(dispatch).toHaveBeenCalledWith(fileStorageExportFile('test.file'));
    });

    it('should dispatch export action when key is pressed', async () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            fileStorage: { files: [testFile] },
        });

        const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

        userEvent.click(treeItem);
        userEvent.keyboard('{ctrl}e');

        expect(dispatch).toHaveBeenCalledWith(fileStorageExportFile('test.file'));
    });
});
