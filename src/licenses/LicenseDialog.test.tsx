// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Classes } from '@blueprintjs/core';
import { act, cleanup } from '@testing-library/react';
import React from 'react';
import * as useHooks from 'usehooks-ts';
import { testRender } from '../../test';
import LicenseDialog from './LicenseDialog';

beforeEach(() => {
    // avoid test environment errors by providing fixed response to useFetch()
    jest.spyOn(useHooks, 'useFetch').mockImplementation(() => ({
        data: [
            {
                name: 'super-duper',
                version: '1.0.0',
                author: 'Joe Somebody',
                license: 'MIT',
                licenseText: '...',
            },
        ],
    }));
});

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
        await act(() => user.click(treeNode));
        expect(dialog.getByText('Joe Somebody')).toBeDefined();
    });
});
