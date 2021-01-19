// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { Classes, ResizeSensor } from '@blueprintjs/core';
import { I18nContext, I18nManager } from '@shopify/react-i18n';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import './index.scss';
import { didSucceed, didUpdate } from './actions/service-worker';
import App from './components/App';
import * as I18nToaster from './components/I18nToaster';
import rootReducer from './reducers';
import reportWebVitals from './reportWebVitals';
import rootSaga from './sagas';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const i18n = new I18nManager({
    locale: 'en',
    onError: (err): void => console.error(err),
});

const toaster = I18nToaster.create(i18n);

const sagaMiddleware = createSagaMiddleware({ context: { notification: { toaster } } });
// TODO: add runtime option or filter - logger affects firmware flash performance
const loggerMiddleware = createLogger({ predicate: () => false });

const store = createStore(
    rootReducer,
    applyMiddleware(sagaMiddleware, loggerMiddleware),
);

// Hook in blueprints dark mode class to setting
let oldDarkMode = false;
store.subscribe(() => {
    const newDarkMode = store.getState().settings.darkMode;
    if (newDarkMode !== oldDarkMode) {
        if (newDarkMode) {
            document.body.classList.add(Classes.DARK);
        } else {
            document.body.classList.remove(Classes.DARK);
        }
        oldDarkMode = newDarkMode;
    }
});

// special styling for beta versions
if (process.env.REACT_APP_VERSION?.match(/beta/)) {
    document.body.classList.add('pb-beta');
}

sagaMiddleware.run(rootSaga);

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <I18nContext.Provider value={i18n}>
                {/* This is a hack for correctly sizing to view height on mobile when not running in fullscreen mode. */}
                {/* https://css-tricks.com/the-trick-to-viewport-units-on-mobile/ */}
                <ResizeSensor
                    onResize={(e): void => {
                        document.documentElement.style.setProperty(
                            '--mobile-pad',
                            `${e[0].contentRect.height - window.innerHeight}px`,
                        );
                    }}
                >
                    <div id="vh" className="h-100 w-100 p-absolute" />
                </ResizeSensor>
                <App />
            </I18nContext.Provider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
    onUpdate: (r) => store.dispatch(didUpdate(r)),
    onSuccess: (r) => store.dispatch(didSucceed(r)),
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
