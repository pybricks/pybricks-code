// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import Toast from 'react-bootstrap/Toast';
import { connect } from 'react-redux';
import { Dispatch } from '../actions';
import { remove } from '../actions/notification';
import en from './notification.en.json';

interface DispatchProps {
    onClose: () => void;
}

interface OwnProps {
    id: number;
    style: string;
    message?: string;
    messageId?: string;
    helpUrl?: string;
}

type NotificationProps = DispatchProps & OwnProps & WithI18nProps;

function mapTitle(style: string): string {
    switch (style) {
        case 'danger':
            return 'Error';
        case 'warning':
            return 'Warning';
        default:
            return 'Info';
    }
}

class Notification extends React.Component<NotificationProps> {
    render(): JSX.Element {
        const title = mapTitle(this.props.style);
        return (
            <Toast
                onClose={(): void => {
                    this.props.onClose();
                }}
                transition={false}
            >
                <Toast.Header>
                    <strong className={`mr-auto text-${this.props.style}`}>
                        {title}
                    </strong>
                </Toast.Header>
                <Toast.Body>
                    <p>
                        {this.props.messageId
                            ? this.props.i18n.translate(this.props.messageId)
                            : this.props.message || 'missing message!'}
                    </p>
                    <p>
                        {this.props.helpUrl && (
                            <a
                                href={this.props.helpUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                More info
                            </a>
                        )}
                    </p>
                </Toast.Body>
            </Toast>
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps): DispatchProps => ({
    onClose: (): void => {
        dispatch(remove(ownProps.id));
    },
});

export default connect(
    null,
    mapDispatchToProps,
)(
    withI18n({
        id: 'notification',
        fallback: en,
        translations: () => ({ en }),
    })(Notification),
);
