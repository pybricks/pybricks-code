// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Button, Intent, Position, Tooltip } from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { TooltipId } from './button';
import en from './button.en.json';

export interface ActionButtonProps {
    /** A unique id for each instance. */
    readonly id: string;
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

class ActionButton extends React.Component<Props> {
    render(): JSX.Element {
        return (
            <Tooltip
                content={this.props.i18n.translate(this.props.tooltip)}
                position={Position.BOTTOM}
            >
                <Button
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
}

export default withI18n({ id: 'actionButton', fallback: en, translations: { en } })(
    ActionButton,
);
