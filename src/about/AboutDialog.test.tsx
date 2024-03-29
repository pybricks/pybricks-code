// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2023 The Pybricks Authors

import { act, getByLabelText, waitFor } from '@testing-library/react';
import React from 'react';
import * as useHooks from 'usehooks-ts';
import { testRender } from '../../test';
import AboutDialog from './AboutDialog';

afterEach(() => {
    jest.restoreAllMocks();
});

it('should close when the button is clicked', async () => {
    const close = jest.fn();

    const [user, dialog] = testRender(<AboutDialog isOpen={true} onClose={close} />);

    await act(() => user.click(dialog.getByLabelText('Close')));

    expect(close).toHaveBeenCalled();
});

it('should manage license dialog open/close', async () => {
    const [user, dialog] = testRender(
        <AboutDialog isOpen={true} onClose={() => undefined} />,
    );

    // avoid test environment errors by providing fixed response to useFetch()
    jest.spyOn(useHooks, 'useFetch').mockImplementation(() => ({}));

    expect(
        dialog.queryByRole('dialog', { name: 'Open Source Software Licenses' }),
    ).toBeNull();

    await act(() => user.click(dialog.getByText('Software Licenses')));

    const licenseDialog = dialog.getByRole('dialog', {
        name: 'Open Source Software Licenses',
    });

    expect(licenseDialog).toBeVisible();

    await act(() => user.click(getByLabelText(licenseDialog, 'Close')));

    await waitFor(() => expect(licenseDialog).not.toBeVisible());
});
