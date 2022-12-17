// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import {
    Button,
    Classes,
    Intent,
    Spinner,
    SpinnerSize,
    useHotkeys,
} from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { mergeProps } from '@react-aria/utils';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { tooltipDelay } from '../app/constants';
import { useToolbarItemFocus } from '../components/toolbar/aria';

const smallScreenThreshold = 700;

export interface ActionButtonProps {
    /** The DOM id for this instance. */
    id: string;
    /** A unique label for each instance. */
    readonly label: string;
    /** Keyboard shortcut. */
    readonly keyboardShortcut?: string;
    /** Tooltip text that appears when hovering over the button. */
    readonly tooltip: string;
    /** Icon shown on the button. */
    readonly icon: string;
    /** When true or undefined, the button is enabled. */
    readonly enabled?: boolean;
    /** When true, show progress indicator instead of icon. */
    readonly showProgress?: boolean;
    /** The progress value (0 to 1) or undefined for indeterminate progress. */
    readonly progress?: number;
    /** Callback that is called when the button is activated (clicked). */
    readonly onAction: () => void;
}

const ActionButton: React.VoidFunctionComponent<ActionButtonProps> = ({
    id,
    label,
    keyboardShortcut,
    tooltip,
    icon,
    enabled,
    showProgress,
    progress,
    onAction,
}) => {
    const [isSmallScreen, setIsSmallScreen] = useState(
        window.innerWidth <= smallScreenThreshold,
    );

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= smallScreenThreshold);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    });

    const buttonSize = isSmallScreen ? SpinnerSize.SMALL : SpinnerSize.STANDARD;

    const hotkeys = useMemo(() => {
        if (!keyboardShortcut) {
            return [];
        }

        return [
            {
                global: true,
                allowInInput: true,
                preventDefault: true,
                combo: keyboardShortcut.replaceAll('-', '+'),
                label,
                onKeyDown: () => {
                    if (enabled) {
                        onAction();
                    }
                },
            },
        ];
    }, [keyboardShortcut, enabled, label, onAction]);

    useHotkeys(hotkeys);

    const { toolbarItemFocusProps, excludeFromTabOrder } = useToolbarItemFocus({ id });

    const handleClick = useCallback(() => {
        if (enabled !== false) {
            onAction();
        }
    }, [enabled, onAction]);

    return (
        <Tooltip2
            content={tooltip}
            placement="bottom"
            hoverOpenDelay={tooltipDelay}
            renderTarget={({
                ref: tooltipTargetRef,
                isOpen: _tooltipIsOpen,
                ...tooltipTargetProps
            }) => (
                <Button
                    id={id}
                    aria-disabled={enabled === false}
                    aria-label={label}
                    elementRef={tooltipTargetRef as React.Ref<HTMLButtonElement>}
                    {...mergeProps(tooltipTargetProps, {
                        className: classNames(
                            'pb-toolbar-action-button',
                            enabled === false && Classes.DISABLED,
                        ),
                    })}
                    intent={Intent.PRIMARY}
                    onClick={handleClick}
                    {...toolbarItemFocusProps}
                    tabIndex={excludeFromTabOrder ? -1 : 0}
                >
                    {showProgress ? (
                        <Spinner
                            value={progress}
                            intent={Intent.PRIMARY}
                            size={buttonSize}
                        />
                    ) : (
                        <img
                            aria-hidden={true}
                            width={`${buttonSize}px`}
                            height={`${buttonSize}px`}
                            src={icon}
                        />
                    )}
                </Button>
            )}
        />
    );
};

export default ActionButton;
