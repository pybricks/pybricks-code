// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import React from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import BluetoothButton from './BluetoothButton';
import FlashButton from './FlashButton';
import LoadButton from './LoadButton';
import ReplButton from './ReplButton';
import RunButton from './RunButton';
import SaveButton from './SaveButton';
import StopButton from './StopButton';

class Toolbar extends React.Component {
    render(): JSX.Element {
        return (
            <ButtonToolbar className="m-2">
                <ButtonGroup className="mr-2" size="lg">
                    <LoadButton id="load" />
                    <SaveButton id="save" />
                </ButtonGroup>
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
        );
    }
}

export default Toolbar;
