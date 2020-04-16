import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { BLEConnectionState } from '../services/BLEConnection';

interface StatusBarState {
    bleState: BLEConnectionState;
}

class StatusBar extends React.Component<{}, StatusBarState> {
    constructor(props: {}) {
        super(props);
        this.state = { bleState: BLEConnectionState.Disconnected };
        this.onAction = this.onAction.bind(this);
    }

    private onAction(action: string): void {
        console.log(action);
    }

    setBLEState(state: BLEConnectionState): void {
        this.setState({ bleState: state });
    }

    render(): JSX.Element {
        return (
            <Row className="bg-info p-2">
                <Col className="col-2">
                    <ProgressBar></ProgressBar>
                </Col>
            </Row>
        );
    }
}

export default StatusBar;
