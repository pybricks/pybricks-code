// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { getByLabelText, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender } from '../../test';
import AboutDialog from './AboutDialog';

it('should close when the button is clicked', () => {
    const close = jest.fn();

    const [dialog] = testRender(<AboutDialog isOpen={true} onClose={close} />);

    userEvent.click(dialog.getByLabelText('Close'));

    expect(close).toHaveBeenCalled();
});

it('should manage license dialog open/close', async () => {
    const [dialog] = testRender(
        <AboutDialog isOpen={true} onClose={() => undefined} />,
    );

    expect(
        dialog.queryByRole('dialog', { name: 'Open Source Software Licenses' }),
    ).toBeNull();

    userEvent.click(dialog.getByText('Software Licenses'));

    const licenseDialog = dialog.getByRole('dialog', {
        name: 'Open Source Software Licenses',
    });

    expect(licenseDialog).toBeVisible();

    userEvent.click(getByLabelText(licenseDialog, 'Close'));

    await waitFor(() => expect(licenseDialog).not.toBeVisible());
});
