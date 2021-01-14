// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Alignment, ButtonGroup, Navbar } from '@blueprintjs/core';
import React from 'react';
import BluetoothButton from './BluetoothButton';
import FlashButton from './FlashButton';
import OpenButton from './OpenButton';
import ReplButton from './ReplButton';
import RunButton from './RunButton';
import SaveAsButton from './SaveAsButton';
import SettingsButton from './SettingsButton';
import StopButton from './StopButton';

class Toolbar extends React.Component {
    render(): JSX.Element {
        return (
            <Navbar
                onContextMenu={(e): void => e.preventDefault()}
                className="no-box-shadow"
            >
                <Navbar.Group>
                    <ButtonGroup>
                        <OpenButton id="open" />
                        <SaveAsButton id="saveAs" />
                    </ButtonGroup>
                    <Navbar.Divider />
                    <ButtonGroup>
                        <RunButton id="run" keyboardShortcut="F5" />
                        <StopButton id="stop" keyboardShortcut="F6" />
                        <ReplButton id="repl" />
                    </ButtonGroup>
                    <Navbar.Divider />
                    <ButtonGroup>
                        <FlashButton id="flash" />
                        <BluetoothButton id="bluetooth" />
                    </ButtonGroup>
                </Navbar.Group>
                <Navbar.Group align={Alignment.RIGHT}>
                    <ButtonGroup>
                        <SettingsButton id="settings" />
                    </ButtonGroup>
                </Navbar.Group>
            </Navbar>
        );
    }
}

export default Toolbar;
