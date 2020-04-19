import React from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import BluetoothButton from './BluetoothButton';
import FlashButton from './FlashButton';
import ReplButton from './ReplButton';
import RunButton from './RunButton';
import StopButton from './StopButton';

class Toolbar extends React.Component {
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
                            <FlashButton id="flash" />
                        </ButtonGroup>
                    </ButtonToolbar>
                </Col>
            </Row>
        );
    }
}

export default Toolbar;
