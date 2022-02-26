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
    /**
     * This should not usually be used directly. It allows Matchable action
     * functions to be passed directly to redux saga effects as an action pattern.
     */
    toString(): ReturnType<F>['type'];
    /**
     * Type guard to ensure an action matches this type.
     */
    matches: MatchFunction<ReturnType<F>>;
    /**
     * Type guard creation function with addition filtering.
     *
     * This is useful for creating a guard function to pass to redux saga
     * effects.
     *
     * @example const action = yield* take(someAction.when((a) => a.property === value));
     *
     * @param predicate An predicate to filter actions.
     */
    when(predicate: (action: ReturnType<F>) => boolean): MatchFunction<ReturnType<F>>;
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
export function createAction<F extends ActionCreationFunction<A>, A extends AnyAction>(
    actionCreator: F,
): Matchable<F, A> {
    // create a default action so we can get the type string.
    const type = actionCreator().type;

    function matches(action: AnyAction): action is ReturnType<F> {
        return action.type === type;
    }

    function when(
        predicate: (action: ReturnType<F>) => boolean,
    ): MatchFunction<ReturnType<F>> {
        return (a: AnyAction): a is ReturnType<F> => {
            if (!matches(a)) {
                return false;
            }

            return predicate(a);
        };
    }

    return Object.assign(actionCreator, <MatchableExtensions<F, A>>{
        toString: () => type,
        matches,
        when,
    });
}
