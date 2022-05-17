// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { I18nContext } from '@shopify/react-i18n';
import React from 'react';
import { OverlayProvider } from 'react-aria';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import './index.scss';
import App from './app/App';
import { appVersion } from './app/constants';
import { i18nManager } from './i18n';
import * as I18nToaster from './notifications/I18nToaster';
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
    },
});

// TODO: add runtime option or filter - logger affects firmware flash performance
const loggerMiddleware = createLogger({ predicate: () => false });

const store = createStore(
    rootReducer,
    applyMiddleware(sagaMiddleware, loggerMiddleware),
);

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
                    <App />
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
