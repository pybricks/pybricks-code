// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { I18nContext, I18nManager } from '@shopify/react-i18n';
import {
    getByLabelText,
    render,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import AboutDialog from './AboutDialog';

it('should close when the button is clicked', () => {
    const store = {
        getState: jest.fn(() => ({ licenses: { list: null } })),
        dispatch: jest.fn(),
        subscribe: jest.fn(),
    } as unknown as Store;
    const i18n = new I18nManager({ locale: 'en' });
    const close = jest.fn();
    render(
        <Provider store={store}>
            <I18nContext.Provider value={i18n}>
                <AboutDialog isOpen={true} onClose={() => close()} />
            </I18nContext.Provider>
        </Provider>,
    );

    userEvent.click(screen.getByLabelText('Close'));

    expect(close).toHaveBeenCalled();
});

it('should manage license dialog open/close', async () => {
    const store = {
        getState: jest.fn(() => ({ licenses: { list: null } })),
        dispatch: jest.fn(),
        subscribe: jest.fn(),
    } as unknown as Store;
    const i18n = new I18nManager({ locale: 'en' });
    render(
        <Provider store={store}>
            <I18nContext.Provider value={i18n}>
                <AboutDialog isOpen={true} onClose={() => undefined} />
            </I18nContext.Provider>
        </Provider>,
    );

    userEvent.click(screen.getByText('Software Licenses'));

    expect(
        screen.getByText(
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
        screen.queryByText(
            `${process.env.REACT_APP_NAME} is built on open source software.`,
            {
                exact: false,
            },
        ),
    );
});
