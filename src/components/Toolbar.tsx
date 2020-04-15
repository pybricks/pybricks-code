import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import React from 'react';
import ActionButton from './ActionButton';
import { BLEConnectionState } from '../services/BLEConnection';

interface ToolbarState {
    bleState: BLEConnectionState;
}

function oneOf(
    bleState: BLEConnectionState,
    ...matches: BLEConnectionState[]
): boolean {
    return matches.indexOf(bleState) >= 0;
}

class Toolbar extends React.Component<{}, ToolbarState> {
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
            <Row>
                <Col>
                    <ButtonToolbar className="m-2">
                        <ButtonGroup className="mr-2" size="lg">
                            <ActionButton
                                id="bluetooth"
                                action={
                                    this.state.bleState ===
                                    BLEConnectionState.Disconnected
                                        ? {
                                              id: 'connect',
                                              tooltip: 'Connect using Bluetooth',
                                              icon: 'btdisconnected.svg',
                                          }
                                        : {
                                              id: 'disconnect',
                                              tooltip: 'Disconnect Bluetooth',
                                              icon: 'btconnected.svg',
                                          }
                                }
                                onAction={this.onAction}
                            />
                            <ActionButton
                                id="run"
                                action={{
                                    id: 'run',
                                    tooltip: 'Download and run this program',
                                    icon: 'run.svg',
                                }}
                                onAction={this.onAction}
                                enabled={oneOf(
                                    this.state.bleState,
                                    BLEConnectionState.Waiting,
                                    BLEConnectionState.Running,
                                    BLEConnectionState.REPL,
                                )}
                            />
                            <ActionButton
                                id="stop"
                                action={
                                    this.state.bleState ===
                                    BLEConnectionState.Downloading
                                        ? {
                                              id: 'cancel',
                                              tooltip: 'Cancel download',
                                              icon: 'stop.svg',
                                          }
                                        : {
                                              id: 'reset',
                                              tooltip: 'Stop everything',
                                              icon: 'stop.svg',
                                          }
                                }
                                onAction={this.onAction}
                                enabled={oneOf(
                                    this.state.bleState,
                                    BLEConnectionState.Waiting,
                                    BLEConnectionState.Downloading,
                                    BLEConnectionState.Running,
                                    BLEConnectionState.REPL,
                                )}
                            />
                        </ButtonGroup>
                        <ButtonGroup className="mr-2" size="lg">
                            <ActionButton
                                id="repl"
                                action={{
                                    id: 'repl',
                                    tooltip: 'Start REPL in terminal',
                                    icon: 'repl.svg',
                                }}
                                onAction={this.onAction}
                                enabled={oneOf(
                                    this.state.bleState,
                                    BLEConnectionState.Waiting,
                                    BLEConnectionState.REPL,
                                )}
                            />
                            <ActionButton
                                id="flash"
                                action={{
                                    id: 'flash',
                                    tooltip: 'Flash hub firmware',
                                    icon: 'firmware.svg',
                                }}
                                onAction={this.onAction}
                                enabled={oneOf(
                                    this.state.bleState,
                                    BLEConnectionState.Disconnected,
                                )}
                            />
                        </ButtonGroup>
                    </ButtonToolbar>
                </Col>
            </Row>
        );
    }
}

export default Toolbar;
