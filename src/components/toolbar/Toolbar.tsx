// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import React, { PropsWithChildren } from 'react';
import { FocusScope } from 'react-aria';
import { useToolbar } from './aria';
import { ToolbarStateContext, useToolbarState } from './state';
import type { AriaToolbarProps } from './types';

type ToolbarProps = Pick<
    AriaToolbarProps,
    'aria-label' | 'aria-labelledby' | 'firstFocusableItemId'
> & {
    /** CSS class name for the tooltip element. */
    className?: string;
};
/**
 * An accessible toolbar component.
 *
 * For accessible keyboard navigation, this needs to be used with a focus
 * manager like `useRovingTabIndex`.
 *
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/toolbar_role
 */
export const Toolbar: React.FunctionComponent<PropsWithChildren<ToolbarProps>> = (
    props,
) => {
    const { className, children } = props;
    const state = useToolbarState(props);
    const { toolbarProps } = useToolbar(props);

    return (
        <div className={className} {...toolbarProps}>
            <ToolbarStateContext.Provider value={state}>
                <FocusScope>{children}</FocusScope>
            </ToolbarStateContext.Provider>
        </div>
    );
};
