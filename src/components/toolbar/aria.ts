// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { filterDOMProps } from '@react-aria/utils';
import {
    FocusEventHandler,
    HTMLAttributes,
    KeyboardEventHandler,
    useCallback,
    useContext,
} from 'react';
import { FocusScope, mergeProps, useFocusManager } from 'react-aria';
import { ToolbarStateContext } from './state';
import type { AriaToolbarProps } from './types';

// for doc comment link
FocusScope;

type ToolbarAria = {
    toolbarProps: HTMLAttributes<HTMLElement>;
};

/** React hook for creating toolbar element props. */
export function useToolbar(props: AriaToolbarProps): ToolbarAria {
    const domProps = filterDOMProps(props, { labelable: true });
    return { toolbarProps: mergeProps(domProps, { role: 'toolbar' }) };
}

type ToolbarItemFocusAria = {
    toolbarItemFocusProps: HTMLAttributes<HTMLElement>;
    excludeFromTabOrder: boolean;
};

/**
 * React hook for creating toolbar item element props for focus management.
 *
 * Using this hook requires the current element to be inside of an
 * {@link ToolbarStateContext} and to be inside of a {@link FocusScope}.
 */
export function useToolbarItemFocus(props: { id: string }): ToolbarItemFocusAria {
    const { id } = props;
    const state = useContext(ToolbarStateContext);
    const focusManager = useFocusManager();

    const onKeyDown = useCallback<KeyboardEventHandler<HTMLElement>>(
        (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    focusManager.focusPrevious({ wrap: true });
                    break;
                case 'ArrowRight':
                    focusManager.focusNext({ wrap: true });
                    break;
                case 'Home':
                    focusManager.focusFirst();
                    break;
                case 'End':
                    focusManager.focusLast();
                    break;
                default:
                    return;
            }
        },
        [focusManager],
    );

    const onFocus = useCallback<FocusEventHandler<HTMLElement>>(
        (e) => {
            state.setLastFocusedItem(e.target.id);
        },
        [state.setLastFocusedItem],
    );
    const excludeFromTabOrder = id !== state.lastFocusedItem;

    return { toolbarItemFocusProps: { onKeyDown, onFocus }, excludeFromTabOrder };
}
