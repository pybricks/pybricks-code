// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import React from 'react';
import { Collapse } from 'react-bootstrap';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { RootState } from '../reducers';
import { Level, NotificationList } from '../reducers/notification';
import Notification from './Notification';

interface StateProps {
    list: NotificationList;
}

type NotificationStackProps = StateProps;

function mapLevelToStyle(level: Level): string {
    switch (level) {
        case Level.Error:
            return 'danger';
        case Level.Warning:
            return 'warning';
        case Level.Info:
            return 'info';
    }
}

class NotificationStack extends React.Component<NotificationStackProps> {
    render(): JSX.Element {
        return (
            <div aria-live="polite" aria-atomic="true" style={{ position: 'relative' }}>
                <div
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        minWidth: '350px',
                        zIndex: 999,
                    }}
                >
                    <TransitionGroup>
                        {this.props.list.map((n) => (
                            <Collapse key={n.id} in={true}>
                                <Notification
                                    id={n.id}
                                    style={mapLevelToStyle(n.level)}
                                    message={n.message}
                                    messageId={n.messageId}
                                    helpUrl={n.helpUrl}
                                />
                            </Collapse>
                        ))}
                    </TransitionGroup>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    list: state.notification.list,
});

export default connect(mapStateToProps)(NotificationStack);
