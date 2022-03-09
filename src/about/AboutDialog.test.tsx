// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { getByLabelText, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender } from '../../test';
import AboutDialog from './AboutDialog';

it('should close when the button is clicked', () => {
    const close = jest.fn();

    const dialog = testRender(<AboutDialog isOpen={true} onClose={() => close()} />);

    userEvent.click(dialog.getByLabelText('Close'));

    expect(close).toHaveBeenCalled();
});

it('should manage license dialog open/close', async () => {
    const dialog = testRender(<AboutDialog isOpen={true} onClose={() => undefined} />);

    userEvent.click(dialog.getByText('Software Licenses'));

    expect(
        dialog.getByText(
            `${process.env.REACT_APP_NAME} is built on open source software.`,
            {
                exact: false,
            },
        ),
    ).toBeInTheDocument();

    const licenseDialog = document.querySelector(
        '.pb-license-dialog',
    ) as HTMLDivElement;
    userEvent.click(getByLabelText(licenseDialog, 'Close'));

    await waitForElementToBeRemoved(() =>
        dialog.queryByText(
            `${process.env.REACT_APP_NAME} is built on open source software.`,
            {
                exact: false,
            },
        ),
    );
});
