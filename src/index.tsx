// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { ResizeSensor } from '@blueprintjs/core';
import { I18nContext, I18nManager } from '@shopify/react-i18n';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import './index.scss';
// import { success, update } from './actions/service-worker';
import App from './components/App';
import NotificationStack from './components/NotificationStack';
import rootReducer from './reducers';
import rootSaga from './sagas';
import * as serviceWorker from './serviceWorker';
import serviceMiddleware from './services';

const sagaMiddleware = createSagaMiddleware();
// TODO: add runtime option or filter - logger affects firmware flash performance
const loggerMiddleware = createLogger({ predicate: () => false });

const i18n = new I18nManager({
    locale: 'en',
    onError: (err): void => console.error(err),
});

const store = createStore(
    rootReducer,
    applyMiddleware(sagaMiddleware, serviceMiddleware, loggerMiddleware),
);

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
                <NotificationStack />
                <App />
            </I18nContext.Provider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
// serviceWorker.register({
//     onUpdate: (r) => store.dispatch(update(r)),
//     onSuccess: (r) => store.dispatch(success(r)),
// });
