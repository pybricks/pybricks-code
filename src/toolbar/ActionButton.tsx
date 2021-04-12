// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import {
    Button,
    Hotkey,
    Hotkeys,
    HotkeysTarget,
    Intent,
    Position,
    Spinner,
    Tooltip,
} from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { tooltipDelay } from '../app/constants';
import { TooltipId } from './i18n';
import en from './i18n.en.json';

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

type Props = ActionButtonProps & WithI18nProps;

@HotkeysTarget
class ActionButton extends React.Component<Props> {
    private buttonRef: React.RefObject<Button> = React.createRef();

    render(): JSX.Element {
        const {
            i18n,
            id,
            icon,
            keyboardShortcut,
            enabled,
            tooltip,
            progressTooltip,
            showProgress,
            progress,
            onAction,
        } = this.props;

        const tooltipText =
            showProgress && progressTooltip
                ? i18n.translate(progressTooltip, {
                      percent:
                          progress === undefined ? '' : i18n.formatPercentage(progress),
                  })
                : i18n.translate(tooltip) +
                  (keyboardShortcut ? ` (${keyboardShortcut})` : '');

        return (
            <Tooltip
                content={tooltipText}
                position={Position.BOTTOM}
                hoverOpenDelay={tooltipDelay}
            >
                <Button
                    ref={this.buttonRef}
                    intent={Intent.PRIMARY}
                    onMouseDown={(e) => e.preventDefault()} // prevent focus
                    onClick={(): void => onAction()}
                    disabled={enabled === false}
                    className="no-box-shadow"
                    style={enabled === false ? { pointerEvents: 'none' } : undefined}
                >
                    {showProgress ? (
                        <Spinner value={progress} intent={Intent.PRIMARY} />
                    ) : (
                        <img src={icon} alt={id} />
                    )}
                </Button>
            </Tooltip>
        );
    }

    renderHotkeys(): React.ReactElement {
        if (!this.props.keyboardShortcut) {
            return <Hotkeys />;
        }

        return (
            <Hotkeys>
                <Hotkey
                    global={true}
                    allowInInput={true}
                    preventDefault={true}
                    combo={this.props.keyboardShortcut.replaceAll('-', '+')}
                    label={this.props.i18n.translate(this.props.tooltip)}
                    onKeyDown={(): void => {
                        if (this.props.enabled) {
                            this.props.onAction();
                        }
                    }}
                />
            </Hotkeys>
        );
    }
}

export default withI18n({ id: 'actionButton', fallback: en, translations: { en } })(
    ActionButton,
);
