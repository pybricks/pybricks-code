// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Classes } from '@blueprintjs/core';
import { mergeProps } from '@react-aria/utils';
import { AriaButtonProps } from '@react-types/button';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { FocusRing, useButton } from 'react-aria';
import { useToolbarItemFocus } from './aria';

type ToolbarButtonProps = Pick<
    AriaButtonProps,
    'aria-label' | 'aria-describedby' | 'id' | 'children'
> & { id: string; className?: string };

/** React component for toolbar item buttons. */
export const ToolbarButton: React.FunctionComponent<ToolbarButtonProps> = (props) => {
    const { className, children } = props;
    const ref = useRef<HTMLButtonElement>(null);

    const { toolbarItemFocusProps, excludeFromTabOrder } = useToolbarItemFocus(props);

    const { buttonProps, isPressed } = useButton(
        mergeProps(props, {
            excludeFromTabOrder,
        }),
        ref,
    );

    return (
        <FocusRing focusRingClass="pb-focus-ring">
            <button
                className={classNames(
                    Classes.BUTTON,
                    isPressed && Classes.ACTIVE,
                    'pb-focus-managed',
                    className,
                )}
                ref={ref}
                {...mergeProps(toolbarItemFocusProps, buttonProps)}
            >
                {children}
            </button>
        </FocusRing>
    );
};
