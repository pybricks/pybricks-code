// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import {
    Button,
    IRef,
    Intent,
    Spinner,
    SpinnerSize,
    useHotkeys,
} from '@blueprintjs/core';
import { Tooltip2 } from '@blueprintjs/popover2';
import { useI18n } from '@shopify/react-i18n';
import React, { useEffect, useMemo, useState } from 'react';
import { tooltipDelay } from '../app/constants';
import { TooltipId } from './i18n';
import en from './i18n.en.json';

const smallScreenThreshold = 700;

export interface ActionButtonProps {
    /** A unique id for each instance. */
    readonly id: string;
    /** Keyboard shortcut. */
    readonly keyboardShortcut?: string;
    /** Tooltip text that appears when hovering over the button. */
    readonly tooltip: TooltipId;
    /** Tooltip text that appears when hovering over the button and @showProgress is true. */
    readonly progressTooltip?: TooltipId;
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

const ActionButton: React.FC<ActionButtonProps> = (props) => {
    const [i18n] = useI18n({ id: 'actionButton', translations: { en }, fallback: en });

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

    const tooltipText =
        props.showProgress && props.progressTooltip
            ? i18n.translate(props.progressTooltip, {
                  percent:
                      props.progress === undefined
                          ? ''
                          : i18n.formatPercentage(props.progress),
              })
            : i18n.translate(props.tooltip) +
              (props.keyboardShortcut ? ` (${props.keyboardShortcut})` : '');

    const hotkeys = useMemo(() => {
        if (!props.keyboardShortcut) {
            return [];
        }

        return [
            {
                global: true,
                allowInInput: true,
                preventDefault: true,
                combo: props.keyboardShortcut.replaceAll('-', '+'),
                label: i18n.translate(props.tooltip),
                onKeyDown: () => {
                    if (props.enabled) {
                        props.onAction();
                    }
                },
            },
        ];
    }, [props, i18n]);

    useHotkeys(hotkeys);

    return (
        <Tooltip2
            content={tooltipText}
            placement="bottom"
            hoverOpenDelay={tooltipDelay}
            renderTarget={({
                ref: tooltipRef,
                isOpen: _tooltipIsOpen,
                ...tooltipProps
            }) => (
                <Button
                    elementRef={tooltipRef as IRef<HTMLButtonElement>}
                    {...tooltipProps}
                    intent={Intent.PRIMARY}
                    // prevent focus from mouse click
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => props.onAction()}
                    disabled={props.enabled === false}
                    style={
                        props.enabled === false ? { pointerEvents: 'none' } : undefined
                    }
                >
                    {props.showProgress ? (
                        <Spinner
                            value={props.progress}
                            intent={Intent.PRIMARY}
                            size={buttonSize}
                        />
                    ) : (
                        <img
                            width={`${buttonSize}px`}
                            height={`${buttonSize}px`}
                            src={props.icon}
                            alt={props.id}
                            style={{ pointerEvents: 'none' }}
                        />
                    )}
                </Button>
            )}
        />
    );
};

export default ActionButton;
