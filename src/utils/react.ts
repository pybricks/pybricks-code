// helper functions for React components

import { IRefObject } from '@blueprintjs/core';
import { useEffect, useMemo, useState } from 'react';
import { createCountFunc } from './iter';

const nextId = createCountFunc();

/**
 * React hook to get a unique identifier, e.g. for linking components via
 * aria-labelledby.
 *
 * @param prefix A namespace prefix for the identifier.
 * @returns A unique identifier in the form "prefix-N"
 */
export const useUniqueId = (prefix: string): string => {
    const [uniqueId] = useState(`${prefix}-${nextId()}`);
    return uniqueId;
};

/** Describes the requested interaction. */
export enum FocusAction {
    /** Move focus to the previous control. */
    MovePrev,
    /** Move focus to the next control. */
    MoveNext,
    /** Move focus to the first control. */
    MoveFirst,
    /** Move focus to the last control. */
    MoveLast,
}

/**
 * React hook to manage roving tab index for accessible keyboard navigation
 * of components.
 *
 * @param elements References to elements to be focuses in the order they
 * they should be focused. The number of elements and order must be constant!
 *
 * @returns A function that should be used to focus an element in reaction to
 * a keyboard event. For example, this can be passed directly as the
 * `onKeyboard` property of the `Toolbar` component.
 */
export function useRovingTabIndex(
    ...elements: Array<IRefObject<HTMLElement>>
): (action: FocusAction) => void {
    // when the component is first mounted, the first item will be the focus target
    useEffect(() => {
        for (const [i, e] of elements.entries()) {
            e.current?.setAttribute('tabindex', i === 0 ? '0' : '-1');
        }
    }, [...elements]);

    return useMemo(() => {
        function move(action: FocusAction): void {
            // default is to focus the first element
            let newFocusIndex = 0;

            if (action === FocusAction.MoveFirst) {
                // correct index is already selected
            } else if (action === FocusAction.MoveLast) {
                newFocusIndex = elements.length - 1;
            } else {
                // find the currently focused element, if any
                const currentFocusIndex = elements.findIndex(
                    (e) => e.current === document.activeElement,
                );

                if (currentFocusIndex >= 0) {
                    if (action === FocusAction.MovePrev) {
                        newFocusIndex = currentFocusIndex - 1;
                    } else if (action === FocusAction.MoveNext) {
                        newFocusIndex = currentFocusIndex + 1;
                    }

                    // handle wrap around
                    newFocusIndex = (newFocusIndex + elements.length) % elements.length;
                }
            }

            for (const [i, e] of elements.entries()) {
                e.current?.setAttribute('tabindex', i === newFocusIndex ? '0' : '-1');

                if (i === newFocusIndex) {
                    e.current?.focus();
                }
            }
        }

        return move;
    }, [...elements]);
}
