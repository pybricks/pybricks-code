// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender } from '../../test';
import Explorer from './Explorer';

describe('archive button', () => {
    it('should be enabled if there are files', () => {
        const explorer = testRender(<Explorer />, {
            fileStorage: { fileNames: ['test.file'] },
        });

        expect(explorer.getByTitle('Backup all files')).toBeEnabled();
    });

    it('should be disabled if there are no files', () => {
        const explorer = testRender(<Explorer />, {
            fileStorage: { fileNames: [] },
        });

        expect(explorer.getByTitle('Backup all files')).toBeDisabled();
    });
});

describe('list item', () => {
    it('should show/hide buttons on hover', () => {
        const explorer = testRender(<Explorer />, {
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

    it('should not focus buttons on click', () => {
        const explorer = testRender(<Explorer />, {
            fileStorage: { fileNames: ['test.file'] },
        });

        const button = explorer.getByTitle('Rename test.file');

        userEvent.click(button);
        expect(button).not.toHaveFocus();
    });
});
