// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Toaster } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../reducers';
import { NotificationList } from '../reducers/notification';
import Notification from './Notification';

interface StateProps {
    list: NotificationList;
}

type NotificationStackProps = StateProps;

class NotificationStack extends React.Component<NotificationStackProps> {
    render(): JSX.Element {
        return (
            <Toaster>
                {this.props.list.map((n) => (
                    <Notification
                        id={n.id}
                        key={n.id}
                        level={n.level}
                        message={n.message}
                        messageId={n.messageId}
                        helpUrl={n.helpUrl}
                    />
                ))}
            </Toaster>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    list: state.notification.list,
});

export default connect(mapStateToProps)(NotificationStack);
