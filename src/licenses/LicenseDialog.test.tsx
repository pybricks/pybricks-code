// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Classes } from '@blueprintjs/core';
import { cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../test';
import LicenseDialog from './LicenseDialog';

afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
    localStorage.clear();
});

describe('LicenseDialog', () => {
    it('should show placeholder if no license is selected', () => {
        const [, dialog] = testRender(
            <LicenseDialog isOpen={true} onClose={() => undefined} />,
        );

        expect(dialog.getByText('Select a package to view the license.')).toBeDefined();
    });

    it('should show a license', async () => {
        jest.spyOn(window, 'fetch').mockResolvedValue(
            new Response(
                JSON.stringify([
                    {
                        name: 'super-duper',
                        version: '1.0.0',
                        author: 'Joe Somebody',
                        license: 'MIT',
                        licenseText: '...',
                    },
                ]),
            ),
        );

        const [user, dialog] = testRender(
            <LicenseDialog isOpen={true} onClose={() => undefined} />,
        );

        // have to wait for async fetch
        const treeNode = await dialog.findByText('super-duper', {
            selector: `.${Classes.TREE_NODE} *`,
        });

        // when the dialog is first shown, no license is selected
        expect(dialog.queryByText('Joe Somebody')).toBeNull();

        // then when you click on a license name, the license is shown
        await user.click(treeNode);
        expect(dialog.getByText('Joe Somebody')).toBeDefined();
    });
});
