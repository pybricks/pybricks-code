// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { AnyAction } from 'redux';

/** A function that creates action objects. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ActionCreationFunction<A extends AnyAction> = (...args: any[]) => A;

/** A function that performs type discrimination on an action. */
type MatchFunction<A extends AnyAction> = (action: AnyAction) => action is A;

/** The extra members that are attached to a function by createAction(). */
type MatchableExtensions<F extends ActionCreationFunction<A>, A extends AnyAction> = {
    toString(): ReturnType<F>['type'];
    matches: MatchFunction<ReturnType<F>>;
};

/** An action creation function that includes MatchableExtensions. */
type Matchable<F extends ActionCreationFunction<A>, A extends AnyAction> = F &
    MatchableExtensions<F, A>;

/**
 * Adds additional members to an action creation function.
 *
 * @param actionCreator The action creation function.
 * @returns actionCreator with type property and match method added.
 */
export function createAction<T extends ActionCreationFunction<A>, A extends AnyAction>(
    actionCreator: T,
): Matchable<T, A> {
    // create a default action so we can get the type string.
    const type = actionCreator().type;

    return Object.assign(actionCreator, <MatchableExtensions<T, A>>{
        toString: () => type,
        matches: (action) => action.type === type,
    });
}
