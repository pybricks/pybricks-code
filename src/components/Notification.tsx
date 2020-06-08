// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { IconName, Intent, Toast } from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from '../actions';
import { NotificationLevel, remove } from '../actions/notification';
import { Level } from '../reducers/notification';
import en from './notification.en.json';

interface DispatchProps {
    onClose: () => void;
}

interface OwnProps {
    id: number;
    level: NotificationLevel;
    message?: string;
    messageId?: string;
    helpUrl?: string;
}

type NotificationProps = DispatchProps & OwnProps & WithI18nProps;

function mapIntent(level: NotificationLevel): Intent {
    switch (level) {
        case Level.Error:
            return Intent.DANGER;
        case Level.Warning:
            return Intent.WARNING;
        case Level.Info:
            return Intent.PRIMARY;
        default:
            return Intent.NONE;
    }
}

function mapIcon(level: NotificationLevel): IconName | undefined {
    switch (level) {
        case Level.Error:
            return 'error';
        case Level.Warning:
            return 'warning-sign';
        case Level.Info:
            return 'info-sign';
        default:
            return undefined;
    }
}

class Notification extends React.Component<NotificationProps> {
    render(): JSX.Element {
        return (
            <Toast
                onDismiss={(): void => {
                    this.props.onClose();
                }}
                timeout={0}
                intent={mapIntent(this.props.level)}
                icon={mapIcon(this.props.level)}
                message={
                    <div>
                        <p>
                            {this.props.messageId
                                ? this.props.i18n.translate(this.props.messageId)
                                : this.props.message || 'missing message!'}
                        </p>
                        {this.props.helpUrl && (
                            <p>
                                <a
                                    href={this.props.helpUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    More info
                                </a>
                            </p>
                        )}
                    </div>
                }
            />
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
        translations: { en },
    })(Notification),
);
