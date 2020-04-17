import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import React from 'react';
import { BLEConnectionState } from '../reducers/ble';
import ActionButton from './ActionButton';
import BluetoothButton from './BluetoothButton';
import RunButton from './RunButton';
import StopButton from './StopButton';
import ReplButton from './ReplButton';

interface ToolbarState {
    bleState: BLEConnectionState;
}

class Toolbar extends React.Component<{}, ToolbarState> {
    constructor(props: {}) {
        super(props);
        this.state = { bleState: BLEConnectionState.Disconnected };
        this.onAction = this.onAction.bind(this);
    }

    private onAction(action?: string): void {
        console.log(action);
    }

    setBLEState(state: BLEConnectionState): void {
        this.setState({ bleState: state });
    }

    render(): JSX.Element {
        return (
            <Row>
                <Col>
                    <ButtonToolbar className="m-2">
                        <ButtonGroup className="mr-2" size="lg">
                            <BluetoothButton id="bluetooth" />
                            <RunButton id="run" />
                            <StopButton id="stop" />
                        </ButtonGroup>
                        <ButtonGroup className="mr-2" size="lg">
                            <ReplButton id="repl" />
                            <ActionButton
                                id="flash"
                                tooltip="Flash hub firmware"
                                icon="firmware.svg"
                                onAction={this.onAction}
                            />
                        </ButtonGroup>
                    </ButtonToolbar>
                </Col>
            </Row>
        );
    }
}

export default Toolbar;
