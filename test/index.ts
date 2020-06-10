// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { END, MulticastChannel, Saga, Task, runSaga, stdChannel } from 'redux-saga';
import { Action } from '../src/actions';
import { RootState } from '../src/reducers';

export class AsyncSaga {
    private channel: MulticastChannel<Action>;
    private dispatches: (Action | END)[];
    private takers: { put: (action: Action | END) => void }[];
    private state: Partial<RootState>;
    private task: Task;

    public constructor(saga: Saga) {
        this.channel = stdChannel();
        this.dispatches = [];
        this.takers = [];
        this.state = {};
        this.task = runSaga(
            {
                channel: this.channel,
                dispatch: this.dispatch.bind(this),
                getState: () => this.state,
                onError: (e) => fail(e),
            },
            saga,
        );
    }

    public numPending(): number {
        return this.dispatches.length;
    }

    public put(action: Action): void {
        this.channel.put(action);
    }

    public take(): Promise<Action> {
        const next = this.dispatches.shift();
        if (next === undefined) {
            // if there are no dispatches queued, then queue the taker to be
            // completed later
            return new Promise((resolve, reject) => {
                this.takers.push({
                    put: (a: Action | END): void => {
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

    public setState(state: Partial<RootState>): void {
        this.state = state;
    }

    public async end(): Promise<void> {
        this.task.cancel();
        await this.task.toPromise();
        if (this.dispatches.some((x) => x.type !== END.type)) {
            fail(`unhandled dispatches remain: ${JSON.stringify(this.dispatches)}`);
        }
    }

    private dispatch(action: Action | END): Action | END {
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
export function lookup(obj: object, id: string): string | undefined {
    const value = id
        .split('.')
        .reduce((pv, cv) => pv && (pv as Record<string, object>)[cv], obj);
    if (typeof value === 'string') {
        return value;
    }
    return undefined;
}
