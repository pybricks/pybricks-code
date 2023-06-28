// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { Classes, Icon, IconSize, Spinner } from '@blueprintjs/core';
import { mergeRefs, useId } from '@react-aria/utils';
import classNames from 'classnames';
import React, { useRef } from 'react';
import { FocusRing, useButton } from 'react-aria';

type ButtonProps = {
    /** Optional DOM ID for the button. */
    id?: string;
    /** The label for the button. */
    label: string;
    /** If true, the label will not be visible (will use aria-label instead). */
    hideLabel?: boolean;
    /** A description of what the button does (not displayed - read by screen reader). */
    description?: string;
    /** When true, the contents of the button will be replaced with a {@link Spinner}. */
    loading?: boolean;
    /** When true, the button will use the {@link Classes.MINIMAL} style. */
    minimal?: boolean;
    /** Icon that will be displayed to the left of the button content. */
    icon: JSX.Element;
    /** A reference to the underlying <button> HTML element. */
    elementRef?: React.ForwardedRef<HTMLButtonElement>;
    /** Called when the button is pressed. */
    onPress?: () => void;
};

/** Similar to Blueprint.js button with better accessibility. */
export const Button: React.FunctionComponent<ButtonProps> = ({
    id,
    label,
    hideLabel,
    description,
    loading,
    minimal,
    icon,
    elementRef,
    onPress,
}) => {
    const isLabelVisible = !hideLabel && !loading;

    const labelId = useId();
    const descriptionId = useId();
    const ref = useRef<HTMLButtonElement>(null);

    const { buttonProps, isPressed } = useButton(
        {
            onPress,
            'aria-label': isLabelVisible ? undefined : label,
            'aria-labelledby': isLabelVisible ? labelId : undefined,
            // REVISIT: aria-description is not widley supported yet
            'aria-describedby': description ? descriptionId : undefined,
        },
        ref,
    );

    return (
        <>
            {/* useButton() breaks the native browser :focus-visible :-/ */}
            <FocusRing focusRingClass="pb-focus-ring">
                <button
                    id={id}
                    className={classNames(Classes.BUTTON, 'pb-focus-managed', {
                        [Classes.ACTIVE]: isPressed,
                        [Classes.LOADING]: loading,
                        [Classes.MINIMAL]: minimal,
                    })}
                    ref={mergeRefs(ref, elementRef ?? null)}
                    {...buttonProps}
                >
                    {loading ? (
                        <Spinner
                            className={Classes.BUTTON_SPINNER}
                            size={IconSize.LARGE}
                        />
                    ) : (
                        <>
                            <Icon icon={icon} />
                            {isLabelVisible && (
                                <span id={labelId} className={Classes.BUTTON_TEXT}>
                                    {label}
                                </span>
                            )}
                        </>
                    )}
                </button>
            </FocusRing>
            {/* This can't be inside the button element, otherwise it messes up the styling */}
            {description && (
                <div id={descriptionId} hidden>
                    {description}
                </div>
            )}
        </>
    );
};
