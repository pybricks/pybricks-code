// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { IconName, Intent, Toast } from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import { PrimitiveReplacementDictionary } from '@shopify/react-i18n/dist/src/types';
import React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from '../actions';
import { NotificationLevel, remove } from '../actions/notification';
import { Level, MessageAction } from '../reducers/notification';
import en from './notification.en.json';

interface DispatchProps {
    onAction: (action: Action) => void;
    onClose: () => void;
}

interface OwnProps {
    id: number;
    level: NotificationLevel;
    message?: string;
    messageId?: string;
    replacements?: PrimitiveReplacementDictionary;
    helpUrl?: string;
    action?: MessageAction;
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
        const {
            action,
            helpUrl,
            i18n,
            level,
            message,
            messageId,
            onAction,
            onClose,
            replacements,
        } = this.props;
        return (
            <Toast
                onDismiss={(): void => onClose()}
                timeout={0}
                intent={mapIntent(level)}
                icon={mapIcon(level)}
                message={
                    <div>
                        <p>
                            {messageId
                                ? i18n.translate(messageId, replacements)
                                : message || 'missing message!'}
                        </p>
                        {helpUrl && (
                            <p>
                                <a
                                    href={helpUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    More info
                                </a>
                            </p>
                        )}
                    </div>
                }
                action={
                    action && {
                        text: i18n.translate(action.titleId),
                        onClick: (): void => onAction(action.action),
                    }
                }
            />
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps): DispatchProps => ({
    onAction: (a): Action => dispatch(a),
    onClose: (): Action => dispatch(remove(ownProps.id)),
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
