// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { ButtonGroup, Navbar } from '@blueprintjs/core';
import React from 'react';
import BluetoothButton from './BluetoothButton';
import FlashButton from './FlashButton';
import OpenButton from './OpenButton';
import ReplButton from './ReplButton';
import RunButton from './RunButton';
import SaveAsButton from './SaveAsButton';
import StopButton from './StopButton';

class Toolbar extends React.Component {
    render(): JSX.Element {
        return (
            <Navbar fixedToTop={true} className="no-box-shadow">
                <Navbar.Group>
                    <ButtonGroup>
                        <OpenButton id="open" />
                        <SaveAsButton id="saveAs" />
                    </ButtonGroup>
                    <Navbar.Divider />
                    <ButtonGroup>
                        <BluetoothButton id="bluetooth" />
                        <RunButton id="run" />
                        <StopButton id="stop" />
                    </ButtonGroup>
                    <Navbar.Divider />
                    <ButtonGroup>
                        <ReplButton id="repl" />
                        <FlashButton id="flash" />
                    </ButtonGroup>
                </Navbar.Group>
            </Navbar>
        );
    }
}

export default Toolbar;
