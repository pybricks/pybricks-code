// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Middleware } from 'redux';
import { Action, Dispatch } from '../actions';
import { RootState } from '../reducers';
import bootloader from './bootloader';
import editor from './editor';
import errorLog from './error-log';

type Service = (
    action: Action,
    dispatch: Dispatch,
    state: RootState,
) => void | Promise<void>;

function runService(
    service: Service,
    action: Action,
    dispatch: Dispatch,
    state: RootState,
): void {
    // Services are deferred so that the current action completes before
    // dispatching another action by calling dispatch() in the service.
    setTimeout(async () => {
        try {
            await service(action, dispatch, state);
        } catch (err) {
            console.log(`Unhandled exception in service: ${err}`);
        }
    }, 0);
}

export function combineServices(...services: Service[]): Service {
    return (a, d, s): void => {
        services.forEach((x) => runService(x, a, d, s));
    };
}

const rootService = combineServices(bootloader, editor, errorLog);

const serviceMiddleware: Middleware = (store) => (next) => (action): unknown => {
    runService(rootService, action, store.dispatch, store.getState());
    return next(action);
};

export default serviceMiddleware;
