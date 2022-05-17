// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import React, { AriaAttributes, KeyboardEventHandler, useCallback } from 'react';
import { FocusAction } from '../../utils/react';

type ToolbarProps = Pick<AriaAttributes, 'aria-label' | 'aria-labelledby'> & {
    /** CSS class name for the tooltip element. */
    className?: string;
    /** Indicates that the toolbar has a vertical orientation. */
    vertical?: boolean;
    /** Called when a keyboard event occurs. */
    onKeyboard?: (action: FocusAction) => void;
};

/**
 * An accessible toolbar component.
 *
 * For accessible keyboard navigation, this needs to be used with a focus
 * manager like `useRovingTabIndex`.
 *
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/toolbar_role
 */
const Toolbar: React.FunctionComponent<ToolbarProps> = ({
    children,
    vertical,
    onKeyboard,
    ...divProps
}) => {
    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>(
        (e) => {
            // ignore all key presses with modifiers
            if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
                return;
            }

            if (e.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) {
                onKeyboard?.(FocusAction.MovePrev);
            } else if (e.key === (vertical ? 'ArrowDown' : 'ArrowRight')) {
                onKeyboard?.(FocusAction.MoveNext);
            } else if (e.key === 'Home') {
                onKeyboard?.(FocusAction.MoveFirst);
            } else if (e.key === 'End') {
                onKeyboard?.(FocusAction.MoveLast);
            } else {
                // allow everything else to propagate.
                return;
            }

            // we consumed the key press
            e.preventDefault();
            e.stopPropagation();
        },
        [vertical, onKeyboard],
    );

    return (
        <div
            role="toolbar"
            aria-orientation={vertical ? 'vertical' : undefined}
            {...divProps}
            onKeyDown={handleKeyDown}
        >
            {children}
        </div>
    );
};

export default Toolbar;
