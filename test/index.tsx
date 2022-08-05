// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { HotkeysProvider } from '@blueprintjs/core';
import { ThunkAction, configureStore } from '@reduxjs/toolkit';
import { I18nContext, I18nManager } from '@shopify/react-i18n';
import { RenderResult, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { AnyAction, PreloadedState, legacy_createStore as createStore } from 'redux';
import { END, MulticastChannel, Saga, Task, runSaga, stdChannel } from 'redux-saga';
import { UUID } from '../src/fileStorage';
import { RootState, rootReducer } from '../src/reducers';
import { RootSagaContext } from '../src/sagas';

// HACK: not a public type so can't be imported directly
type UserEvent = ReturnType<typeof userEvent.setup>;

export class AsyncSaga {
    private channel: MulticastChannel<AnyAction>;
    private dispatches: AnyAction[];
    private takers: { put: (action: AnyAction) => void }[];
    private state: RootState;
    private task: Task;

    public constructor(saga: Saga, context?: Partial<RootSagaContext>) {
        this.channel = stdChannel();
        this.dispatches = [];
        this.takers = [];
        this.state = createStore(rootReducer).getState();
        this.task = runSaga(
            {
                channel: this.channel,
                dispatch: this.dispatch.bind(this),
                getState: () => this.state,
                onError: (e, _i): void => {
                    throw e;
                },
                context,
            },
            saga,
        );
    }

    public numPending(): number {
        return this.dispatches.length;
    }

    public put(action: AnyAction): void {
        this.channel.put(action);
    }

    public take(): Promise<AnyAction> {
        const next = this.dispatches.shift();
        if (next === undefined) {
            // if there are no dispatches queued, then queue the taker to be
            // completed later
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(reject, 1000, new Error('timed out'));

                this.takers.push({
                    put: (a: AnyAction): void => {
                        if (a.type === END.type) {
                            reject();
                        } else {
                            clearTimeout(timeout);
                            resolve(a);
                        }
                    },
                });
            });
        }
        // otherwise complete immediately
        if (next.type === END.type) {
            return Promise.reject();
        }
        return Promise.resolve(next);
    }

    public updateState(state: PreloadedState<RootState>): void {
        for (const key of Object.keys(state) as Array<keyof RootState>) {
            // @ts-expect-error: writing to readonly for testing
            this.state[key] = { ...this.state[key], ...state[key] };
        }
    }

    /**
     * Cancel the saga. Useful for testing task cancellation.
     */
    public cancel(): void {
        this.task.cancel();
    }

    public async end(): Promise<void> {
        this.task.cancel();
        await this.task.toPromise();
        if (this.dispatches.some((x) => x.type !== END.type)) {
            throw Error(
                `unhandled dispatches remain: ${JSON.stringify(this.dispatches)}`,
            );
        }
    }

    private dispatch(action: AnyAction): AnyAction {
        const taker = this.takers.shift();
        if (taker === undefined) {
            // if there are no takers waiting, the queue the action
            this.dispatches.push(action);
        } else {
            // otherwise complete the promise
            taker.put(action);
        }
        return action;
    }
}

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Looks up a nested property in an object.
 * @param obj The object
 * @param id The property path
 */
export function lookup(obj: unknown, id: string): string | undefined {
    const value = id
        .split('.')
        .reduce((pv, cv) => pv && (pv as Record<string, unknown>)[cv], obj);
    if (typeof value === 'string') {
        return value;
    }
    return undefined;
}

/**
 * Customized version of @testing-library/react render function.
 *
 * https://testing-library.com/docs/react-testing-library/setup#custom-render
 *
 * @param component The component to render.
 * @param state Any state required by the component.
 * @returns The render result and a spy on the dispatch method.
 */
export const testRender = (
    component: ReactElement,
    state?: PreloadedState<RootState>,
): [
    UserEvent,
    RenderResult,
    jest.SpyInstance<
        unknown,
        [
            action:
                | AnyAction
                | ThunkAction<
                      unknown,
                      ReturnType<typeof rootReducer>,
                      undefined,
                      AnyAction
                  >,
        ]
    >,
] => {
    const user = userEvent.setup();
    const store = configureStore({
        reducer: rootReducer,
        preloadedState: state,
    });
    const dispatch = jest.spyOn(store, 'dispatch');

    const i18n = new I18nManager({ locale: 'en' });

    const result = render(
        <Provider store={store}>
            <I18nContext.Provider value={i18n}>
                <HotkeysProvider>{component}</HotkeysProvider>
            </I18nContext.Provider>
        </Provider>,
    );

    return [user, result, dispatch];
};

/**
 * Formats a number as a UUID string.
 *
 * The UUID will look like `XXXXXXXX-0000-0000-0000-00000000`.
 *
 * This allows for deterministic UUIDs for testing.
 *
 * @param id A unique identifier.
 */
export function uuid(id: number): UUID {
    return `${id.toString().padStart(8, '0')}-0000-0000-0000-000000000000` as UUID;
}
