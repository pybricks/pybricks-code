// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { I18nContext, I18nManager } from '@shopify/react-i18n';
import {
    fireEvent,
    render,
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import Editor from './Editor';

function getTextArea(): HTMLTextAreaElement {
    // the textarea in ace editor doesn't actually have any contents, but
    // it gets the focus for input.
    return screen.getByDisplayValue('') as HTMLTextAreaElement;
}

it('should focus the text area', () => {
    const store = {
        getState: jest.fn(() => ({
            editor: { current: null },
            settings: { darkMode: false, showDocs: false },
        })),
        dispatch: jest.fn(),
        subscribe: jest.fn(),
    } as unknown as Store;
    const i18n = new I18nManager({ locale: 'en' });
    render(
        <Provider store={store}>
            <I18nContext.Provider value={i18n}>
                <Editor />
            </I18nContext.Provider>
        </Provider>,
    );

    expect(getTextArea()).toHaveFocus();
});

describe('context menu', () => {
    it('should show the context menu', async () => {
        const store = {
            getState: jest.fn(() => ({
                editor: { current: null },
                settings: { darkMode: false, showDocs: false },
            })),
            dispatch: jest.fn(),
            subscribe: jest.fn(),
        } as unknown as Store;
        const i18n = new I18nManager({ locale: 'en' });

        render(
            <Provider store={store}>
                <I18nContext.Provider value={i18n}>
                    <Editor />
                </I18nContext.Provider>
            </Provider>,
        );

        fireEvent.contextMenu(screen.getByText('Write your program here...'));

        await waitFor(() => {
            expect(screen.getByText('Copy')).toBeInTheDocument();
        });
    });

    it('should hide the context menu when Escape is pressed', async () => {
        const store = {
            getState: jest.fn(() => ({
                editor: { current: null },
                settings: { darkMode: false, showDocs: false },
            })),
            dispatch: jest.fn(),
            subscribe: jest.fn(),
        } as unknown as Store;
        const i18n = new I18nManager({ locale: 'en' });

        render(
            <Provider store={store}>
                <I18nContext.Provider value={i18n}>
                    <Editor />
                </I18nContext.Provider>
            </Provider>,
        );

        fireEvent.contextMenu(screen.getByText('Write your program here...'));

        expect(screen.getByText('Copy')).toBeInTheDocument();

        userEvent.type(screen.getByText('Copy'), '{esc}');

        await waitForElementToBeRemoved(() => screen.queryByText('Copy'));

        // editor should be focused after context menu closes
        expect(document.activeElement).toBe(getTextArea());
    });
});
