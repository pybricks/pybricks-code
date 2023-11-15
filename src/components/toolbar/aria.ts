// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { filterDOMProps } from '@react-aria/utils';
import {
    FocusEventHandler,
    HTMLAttributes,
    KeyboardEventHandler,
    useCallback,
    useContext,
} from 'react';
import { FocusScope, mergeProps, useFocusManager } from 'react-aria';
import { assert } from '../../utils';
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
    const { lastFocusedItem, setLastFocusedItem } = useContext(ToolbarStateContext);
    const focusManager = useFocusManager();

    assert(
        focusManager !== undefined,
        'useToolbarItemFocus must be inside of a FocusScope',
    );

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
            setLastFocusedItem(e.target.id);
        },
        [setLastFocusedItem],
    );

    const excludeFromTabOrder = id !== lastFocusedItem;

    return { toolbarItemFocusProps: { onKeyDown, onFocus }, excludeFromTabOrder };
}
