import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Image from 'react-bootstrap/Image';
import React from 'react';

interface ActionButtonProperties {
    readonly id: string;
    readonly action: {
        readonly id: string;
        readonly tooltip: string;
        readonly icon: string;
    };
    readonly onAction: (action: string) => void;
    readonly enabled?: boolean;
}

class ActionButton extends React.Component<ActionButtonProperties> {
    render(): JSX.Element {
        return (
            <OverlayTrigger
                placement="bottom"
                overlay={
                    <Tooltip id={`${this.props.id}-tooltip`}>
                        {this.props.action.tooltip}.
                    </Tooltip>
                }
            >
                <Button
                    variant="primary"
                    onClick={(): void => this.props.onAction(this.props.action.id)}
                    disabled={this.props.enabled === false}
                    style={
                        this.props.enabled === false
                            ? { pointerEvents: 'none' }
                            : undefined
                    }
                >
                    <Image
                        src={`/static/images/${this.props.action.icon}`}
                        alt={this.props.action.id}
                    />
                </Button>
            </OverlayTrigger>
        );
    }
}

export default ActionButton;
