// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2024 The Pybricks Authors

import './index.scss';
import { HotkeysProvider, OverlayToaster } from '@blueprintjs/core';
import { configureStore } from '@reduxjs/toolkit';
import { I18nContext } from '@shopify/react-i18n';
import React from 'react';
import { OverlayProvider } from 'react-aria';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import App from './app/App';
import { appVersion } from './app/constants';
import { db } from './fileStorage/context';
import { defaultHubCenterContext } from './hubcenter/HubCenterContext';
import { i18nManager } from './i18n';
import { rootReducer } from './reducers';
import { serializableCheck } from './redux';
import reportWebVitals from './reportWebVitals';
import rootSaga, { RootSagaContext } from './sagas';
import { defaultTerminalContext } from './terminal/TerminalContext';
import { defined } from './utils';
import { createCountFunc } from './utils/iter';

const toasterRef = React.createRef<OverlayToaster>();

const sagaMiddleware = createSagaMiddleware<RootSagaContext>({
    context: {
        nextMessageId: createCountFunc(),
        terminal: defaultTerminalContext,
        hubcenter: defaultHubCenterContext,
        fileStorage: db,
        toasterRef,
    },
});

// TODO: add runtime option or filter - logger affects firmware flash performance
const loggerMiddleware = createLogger({ predicate: () => false });

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck })
            .concat(sagaMiddleware)
            .concat(loggerMiddleware),
});

// special styling for beta versions
if (appVersion.match(/beta/)) {
    document.body.classList.add('pb-beta');
}
if (appVersion.match(/private/)) {
    document.body.classList.add('pb-private');
}

// prevent default drag/drop which just "downloads" any file dropped anywhere
// in the browser window

const dragEventHandler = (e: DragEvent) => {
    if (
        e.target instanceof Element &&
        !e.target.classList.contains('pb-dropzone-root')
    ) {
        e.preventDefault();

        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'none';
            e.dataTransfer.dropEffect = 'none';
        }
    }
};

window.addEventListener('dragenter', dragEventHandler, false);
window.addEventListener('dragover', dragEventHandler);
window.addEventListener('drop', dragEventHandler);

sagaMiddleware.run(rootSaga);

const container = document.getElementById('root');
defined(container);
const root = createRoot(container);

root.render(
    <Provider store={store}>
        <I18nContext.Provider value={i18nManager}>
            <OverlayProvider>
                <HotkeysProvider>
                    <App />
                </HotkeysProvider>
            </OverlayProvider>
            <OverlayToaster ref={toasterRef} />
        </I18nContext.Provider>
    </Provider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
