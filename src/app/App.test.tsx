// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { I18nContext, I18nManager } from '@shopify/react-i18n';
import { render } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { RootState } from '../reducers';
import App from './App';

it.each([false, true])('should render', (darkMode) => {
    const store = mock<Store<RootState>>({
        getState: () => mock<RootState>({ settings: { darkMode } }),
    });

    const i18n = new I18nManager({ locale: 'en' });

    render(
        <Provider store={store}>
            <I18nContext.Provider value={i18n}>
                <App />
            </I18nContext.Provider>
        </Provider>,
    );
});
