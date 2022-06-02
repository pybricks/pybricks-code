// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { getByLabelText, waitFor } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../test';
import AboutDialog from './AboutDialog';

it('should close when the button is clicked', async () => {
    const close = jest.fn();

    const [user, dialog] = testRender(<AboutDialog isOpen={true} onClose={close} />);

    await user.click(dialog.getByLabelText('Close'));

    expect(close).toHaveBeenCalled();
});

it('should manage license dialog open/close', async () => {
    const [user, dialog] = testRender(
        <AboutDialog isOpen={true} onClose={() => undefined} />,
    );

    expect(
        dialog.queryByRole('dialog', { name: 'Open Source Software Licenses' }),
    ).toBeNull();

    await user.click(dialog.getByText('Software Licenses'));

    const licenseDialog = dialog.getByRole('dialog', {
        name: 'Open Source Software Licenses',
    });

    expect(licenseDialog).toBeVisible();

    await user.click(getByLabelText(licenseDialog, 'Close'));

    await waitFor(() => expect(licenseDialog).not.toBeVisible());
});
