// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import { createEpicMiddleware } from 'redux-observable';
import createSagaMiddleware from 'redux-saga';
import thunkMiddleware from 'redux-thunk';
import './index.scss';
import * as notification from './actions/notification';
import App from './components/App';
import NotificationStack from './components/NotificationStack';
import rootEpic from './epics';
import rootReducer from './reducers';
import rootSaga from './sagas';
import * as serviceWorker from './serviceWorker';
import serviceMiddleware from './services';

const sagaMiddleware = createSagaMiddleware();
const epicMiddleware = createEpicMiddleware();
// TODO: add runtime option or filter - logger affects firmware flash performance
const loggerMiddleware = createLogger({ predicate: () => false });

const store = createStore(
    rootReducer,
    applyMiddleware(
        thunkMiddleware,
        sagaMiddleware,
        epicMiddleware,
        serviceMiddleware,
        loggerMiddleware,
    ),
);

sagaMiddleware.run(rootSaga);
epicMiddleware.run(rootEpic);

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <NotificationStack />
            <App />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register({
    onUpdate: () => {
        store.dispatch(
            notification.add(
                'info',
                'New content is available and will be used when all ' +
                    'tabs for this page are closed. See https://bit.ly/CRA-PWA.',
            ),
        );
    },
    onSuccess: () => {
        store.dispatch(notification.add('info', 'Content is cached for offline use.'));
    },
});
