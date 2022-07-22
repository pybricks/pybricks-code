// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { ButtonGroup } from '@blueprintjs/core';
import React from 'react';
import { useId } from 'react-aria';
import { Toolbar as UtilsToolbar } from '../components/toolbar/Toolbar';
import BluetoothButton from './buttons/bluetooth/BluetoothButton';
import ReplButton from './buttons/repl/ReplButton';
import RunButton from './buttons/run/RunButton';
import StopButton from './buttons/stop/StopButton';

import './toolbar.scss';

const Toolbar: React.VFC = () => {
    const flashButtonId = useId();
    const bluetoothButtonId = useId();
    const runButtonId = useId();
    const stopButtonId = useId();
    const replButtonId = useId();

    return (
        <UtilsToolbar className="pb-toolbar" firstFocusableItemId={flashButtonId}>
            <ButtonGroup className="pb-toolbar-group pb-align-left">
                <BluetoothButton id={bluetoothButtonId} />
            </ButtonGroup>
            <ButtonGroup className="pb-toolbar-group pb-align-left">
                <RunButton id={runButtonId} />
                <StopButton id={stopButtonId} />
                <ReplButton id={replButtonId} />
            </ButtonGroup>
        </UtilsToolbar>
    );
};

export default Toolbar;
