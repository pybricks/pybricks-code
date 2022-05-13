// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender, uuid } from '../../test';
import Explorer from './Explorer';
import {
    explorerActivateFile,
    explorerArchiveAllFiles,
    explorerCreateNewFile,
    explorerDeleteFile,
    explorerDuplicateFile,
    explorerExportFile,
    explorerImportFiles,
} from './actions';
import { ExplorerFileInfo } from './reducers';

afterEach(async () => {
    jest.restoreAllMocks();
    cleanup();
    localStorage.clear();
});

const testFile: ExplorerFileInfo = {
    id: uuid(0),
    name: 'test.file',
};

describe('archive button', () => {
    it('should dispatch action when clicked', () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            explorer: { files: [testFile] },
        });

        const button = explorer.getByTitle('Backup all files');
        expect(button).toBeEnabled();

        userEvent.click(button);
        expect(dispatch).toHaveBeenCalledWith(explorerArchiveAllFiles());
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
    it('should dispatch action when clicked', async () => {
        const [explorer, dispatch] = testRender(<Explorer />);

        const button = explorer.getByTitle('Create a new file');

        userEvent.click(button);
        expect(dispatch).toHaveBeenCalledWith(explorerCreateNewFile());
    });
});

describe('tree item', () => {
    it('should dispatch action when clicked', async () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            explorer: { files: [testFile] },
        });

        const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

        userEvent.click(treeItem);

        expect(dispatch).toHaveBeenCalledWith(explorerActivateFile('test.file'));
    });

    it('should dispatch action when key is pressed', async () => {
        const [explorer, dispatch] = testRender(<Explorer />, {
            explorer: { files: [testFile] },
        });

        const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

        userEvent.click(treeItem);
        userEvent.keyboard('{enter}');

        expect(dispatch).toHaveBeenCalledWith(explorerActivateFile('test.file'));
    });

    describe('duplicate', () => {
        it('should dispatch action when button is clicked', async () => {
            const [explorer, dispatch] = testRender(<Explorer />, {
                explorer: { files: [testFile] },
            });

            // NB: this button is intentionally not accessible (by role) since
            // there is a keyboard shortcut.
            const button = explorer.getByTitle('Duplicate test.file');

            userEvent.click(button);

            expect(dispatch).toHaveBeenCalledWith(explorerDuplicateFile('test.file'));

            // should not propagate to treeitem
            expect(dispatch).toHaveBeenCalledTimes(1);
        });

        it('should dispatch action when key is pressed', async () => {
            const [explorer, dispatch] = testRender(<Explorer />, {
                explorer: { files: [testFile] },
            });

            const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

            userEvent.click(treeItem);
            userEvent.keyboard('{ctrl}d');

            expect(dispatch).toHaveBeenCalledWith(explorerDuplicateFile('test.file'));
        });
    });

    describe('export', () => {
        it('should dispatch export action when button is clicked', async () => {
            const [explorer, dispatch] = testRender(<Explorer />, {
                explorer: { files: [testFile] },
            });

            // NB: this button is intentionally not accessible (by role) since
            // there is a keyboard shortcut.
            const button = explorer.getByTitle('Export test.file');

            userEvent.click(button);

            expect(dispatch).toHaveBeenCalledWith(explorerExportFile('test.file'));

            // should not propagate to treeitem
            expect(dispatch).toHaveBeenCalledTimes(1);
        });

        it('should dispatch export action when key is pressed', async () => {
            const [explorer, dispatch] = testRender(<Explorer />, {
                explorer: { files: [testFile] },
            });

            const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

            userEvent.click(treeItem);
            userEvent.keyboard('{ctrl}e');

            expect(dispatch).toHaveBeenCalledWith(explorerExportFile('test.file'));
        });
    });

    describe('delete', () => {
        it('should dispatch delete action when button is clicked', async () => {
            const [explorer, dispatch] = testRender(<Explorer />, {
                explorer: { files: [testFile] },
            });

            // NB: this button is intentionally not accessible (by role) since
            // there is a keyboard shortcut.
            const button = explorer.getByTitle('Delete test.file');

            userEvent.click(button);

            expect(dispatch).toHaveBeenCalledWith(explorerDeleteFile('test.file'));

            // should not propagate to treeitem
            expect(dispatch).toHaveBeenCalledTimes(1);
        });

        it('should dispatch delete action when key is pressed', async () => {
            const [explorer, dispatch] = testRender(<Explorer />, {
                explorer: { files: [testFile] },
            });

            const treeItem = explorer.getByRole('treeitem', { name: 'test.file' });

            userEvent.click(treeItem);
            userEvent.keyboard('{del}');

            expect(dispatch).toHaveBeenCalledWith(explorerDeleteFile('test.file'));
        });
    });
});
