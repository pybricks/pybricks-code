// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { AnyAction } from 'redux';
import { END, MulticastChannel, Saga, Task, runSaga, stdChannel } from 'redux-saga';
import { RootState } from '../src/reducers';

type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

export class AsyncSaga {
    private channel: MulticastChannel<AnyAction>;
    private dispatches: (AnyAction | END)[];
    private takers: { put: (action: AnyAction | END) => void }[];
    private state: RecursivePartial<RootState>;
    private task: Task;

    public constructor(
        saga: Saga,
        state: RecursivePartial<RootState> = {},
        context?: Record<string, unknown>,
    ) {
        this.channel = stdChannel();
        this.dispatches = [];
        this.takers = [];
        this.state = state;
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
                this.takers.push({
                    put: (a: AnyAction | END): void => {
                        if (a.type === END.type) {
                            reject();
                        } else {
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

    public updateState(state: RecursivePartial<RootState>): void {
        for (const key of Object.keys(state) as Array<keyof RootState>) {
            // @ts-expect-error: writing to readonly for testing
            this.state[key] = { ...this.state[key], ...state[key] };
        }
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

    private dispatch(action: AnyAction | END): AnyAction | END {
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
