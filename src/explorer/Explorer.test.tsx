// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { getByLabelText, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender } from '../../test';
import {
    fileStorageArchiveAllFiles,
    fileStorageExportFile,
} from '../fileStorage/actions';
import Explorer from './Explorer';
import { explorerDeleteFile, explorerImportFiles } from './actions';

describe('archive button', () => {
    it('should be enabled if there are files', () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            fileStorage: { fileNames: ['test.file'] },
        });

        const button = explorer.getByTitle('Backup all files');
        expect(button).toBeEnabled();

        userEvent.click(button);
        expect(dispatch).toHaveBeenCalledWith(fileStorageArchiveAllFiles());
    });

    it('should be disabled if there are no files', () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            fileStorage: { fileNames: [] },
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

describe('list item', () => {
    it('should show/hide buttons on hover', () => {
        const [explorer] = testRender(<Explorer />, {
            fileStorage: { fileNames: ['test.file'] },
        });

        const button = explorer.getByTitle('Rename test.file');

        // by default, the buttons are hidden
        expect(button).not.toBeVisible();

        // but are visible when hovered
        userEvent.hover(button);
        expect(button).toBeVisible();

        // and hide again when unhovered
        userEvent.unhover(button);
        expect(button).not.toBeVisible();
    });

    it('should dispatch delete action when button is clicked', async () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            fileStorage: { fileNames: ['test.file'] },
        });

        const button = explorer.getByTitle('Delete test.file');

        userEvent.click(button);

        expect(dispatch).toHaveBeenCalledWith(explorerDeleteFile('test.file'));
    });

    it('should dispatch export action when button is clicked', async () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            fileStorage: { fileNames: ['test.file'] },
        });

        const button = explorer.getByTitle('Export test.file');

        userEvent.click(button);

        expect(dispatch).toHaveBeenCalledWith(fileStorageExportFile('test.file'));
    });
});
