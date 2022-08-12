// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import './index.scss';
import { HotkeysProvider } from '@blueprintjs/core';
import { configureStore } from '@reduxjs/toolkit';
import { I18nContext } from '@shopify/react-i18n';
import React from 'react';
import { OverlayProvider } from 'react-aria';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import App from './app/App';
import { appVersion } from './app/constants';
import { db } from './fileStorage/context';
import { i18nManager } from './i18n';
import * as I18nToaster from './i18nToaster';
import { rootReducer } from './reducers';
import reportWebVitals from './reportWebVitals';
import rootSaga, { RootSagaContext } from './sagas';
import { defaultTerminalContext } from './terminal/TerminalContext';
import ViewHeightSensor from './utils/ViewHeightSensor';
import { createCountFunc } from './utils/iter';

const toaster = I18nToaster.create(i18nManager);

const sagaMiddleware = createSagaMiddleware<RootSagaContext>({
    context: {
        nextMessageId: createCountFunc(),
        notification: { toaster },
        terminal: defaultTerminalContext,
        fileStorage: db,
        toaster,
    },
});

// TODO: add runtime option or filter - logger affects firmware flash performance
const loggerMiddleware = createLogger({ predicate: () => false });

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActionPaths: [
                    // copy of defaults
                    'meta.arg',
                    'meta.baseQueryMeta',
                    // monoco view state has class-based object but is technically serializable
                    'viewState.viewState.firstPosition',
                    // contain ArrayBuffer or DataView
                    'data',
                    'firmwareZip',
                    'payload',
                    // Error is not serializable
                    'error',
                    'props.error',
                ],
            },
        })
            .concat(sagaMiddleware)
            .concat(loggerMiddleware),
});

// special styling for beta versions
if (appVersion.match(/beta/)) {
    document.body.classList.add('pb-beta');
}

sagaMiddleware.run(rootSaga);

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <I18nContext.Provider value={i18nManager}>
                <ViewHeightSensor />
                <OverlayProvider>
                    <HotkeysProvider>
                        <App />
                    </HotkeysProvider>
                </OverlayProvider>
            </I18nContext.Provider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
