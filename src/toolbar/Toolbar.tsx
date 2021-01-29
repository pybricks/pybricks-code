// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Alignment, ButtonGroup, Navbar } from '@blueprintjs/core';
import React from 'react';
import OpenButton from '../editor/OpenButton';
import SaveAsButton from '../editor/SaveAsButton';
import FlashButton from '../firmware/FlashButton';
import BluetoothButton from '../hub/BluetoothButton';
import ReplButton from '../hub/ReplButton';
import RunButton from '../hub/RunButton';
import StopButton from '../hub/StopButton';
import SettingsButton from '../settings/SettingsButton';

import './toolbar.scss';

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
