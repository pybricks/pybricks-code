// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import React from 'react';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

export interface ActionButtonProps {
    /** A unique id for each instance. */
    readonly id: string;
    /** Tooltip text that appears when hovering over the button. */
    readonly tooltip: string;
    /** Icon shown on the button. */
    readonly icon: string;
    /** When true or undefined, the button is enabled. */
    readonly enabled?: boolean;
    /** Callback that is called when the button is activated (clicked). */
    readonly onAction: () => void;
}

class ActionButton extends React.Component<ActionButtonProps> {
    render(): JSX.Element {
        return (
            <OverlayTrigger
                placement="bottom"
                overlay={
                    <Tooltip id={`${this.props.id}-tooltip`}>
                        {this.props.tooltip}.
                    </Tooltip>
                }
            >
                <Button
                    variant="light"
                    onClick={(): void => this.props.onAction()}
                    disabled={this.props.enabled === false}
                    style={
                        this.props.enabled === false
                            ? { pointerEvents: 'none' }
                            : undefined
                    }
                >
                    <Image src={this.props.icon} alt={this.props.id} />
                </Button>
            </OverlayTrigger>
        );
    }
}

export default ActionButton;
