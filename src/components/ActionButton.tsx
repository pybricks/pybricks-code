// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import {
    Button,
    Hotkey,
    Hotkeys,
    HotkeysTarget,
    Intent,
    Position,
    Tooltip,
} from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { TooltipId } from './button-i18n';
import en from './button-i18n.en.json';

export interface ActionButtonProps {
    /** A unique id for each instance. */
    readonly id: string;
    /** Keyboard shortcut. */
    readonly keyboardShortcut?: string;
    /** Tooltip text that appears when hovering over the button. */
    readonly tooltip: TooltipId;
    /** Icon shown on the button. */
    readonly icon: string;
    /** When true or undefined, the button is enabled. */
    readonly enabled?: boolean;
    /** Callback that is called when the button is activated (clicked). */
    readonly onAction: () => void;
}

type Props = ActionButtonProps & WithI18nProps;

@HotkeysTarget
class ActionButton extends React.Component<Props> {
    private buttonRef: React.RefObject<Button> = React.createRef();

    render(): JSX.Element {
        let tooltipText = this.props.i18n.translate(this.props.tooltip);
        if (this.props.keyboardShortcut) {
            tooltipText += ` (${this.props.keyboardShortcut})`;
        }
        return (
            <Tooltip content={tooltipText} position={Position.BOTTOM}>
                <Button
                    ref={this.buttonRef}
                    intent={Intent.PRIMARY}
                    onClick={(): void => this.props.onAction()}
                    disabled={this.props.enabled === false}
                    className="no-box-shadow"
                    style={
                        this.props.enabled === false
                            ? { pointerEvents: 'none' }
                            : undefined
                    }
                >
                    <img src={this.props.icon} alt={this.props.id} />
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
