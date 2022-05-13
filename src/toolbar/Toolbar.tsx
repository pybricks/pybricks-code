// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { ButtonGroup } from '@blueprintjs/core';
import React from 'react';
import BluetoothButton from './buttons/bluetooth/BluetoothButton';
import FlashButton from './buttons/flash/FlashButton';
import ReplButton from './buttons/repl/ReplButton';
import RunButton from './buttons/run/RunButton';
import StopButton from './buttons/stop/StopButton';

import './toolbar.scss';

const Toolbar: React.VFC = (_props) => {
    return (
        <div role="toolbar" className="pb-toolbar">
            <ButtonGroup className="pb-toolbar-group pb-align-left">
                <FlashButton />
                <BluetoothButton />
            </ButtonGroup>
            <ButtonGroup className="pb-toolbar-group pb-align-left">
                <RunButton />
                <StopButton />
                <ReplButton />
            </ButtonGroup>
        </div>
    );
};

export default Toolbar;
