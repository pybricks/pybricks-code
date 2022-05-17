// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { ButtonGroup } from '@blueprintjs/core';
import React, { useRef } from 'react';
import UtilsToolbar from '../components/toolbar/Toolbar';
import { useRovingTabIndex } from '../utils/react';
import BluetoothButton from './buttons/bluetooth/BluetoothButton';
import FlashButton from './buttons/flash/FlashButton';
import ReplButton from './buttons/repl/ReplButton';
import RunButton from './buttons/run/RunButton';
import StopButton from './buttons/stop/StopButton';

import './toolbar.scss';

const Toolbar: React.VFC = () => {
    const flashButtonRef = useRef<HTMLButtonElement>(null);
    const bluetoothButtonRef = useRef<HTMLButtonElement>(null);
    const runButtonRef = useRef<HTMLButtonElement>(null);
    const stopButtonRef = useRef<HTMLButtonElement>(null);
    const replButtonRef = useRef<HTMLButtonElement>(null);

    const moveFocus = useRovingTabIndex(
        flashButtonRef,
        bluetoothButtonRef,
        runButtonRef,
        stopButtonRef,
        replButtonRef,
    );

    return (
        <UtilsToolbar className="pb-toolbar" onKeyboard={moveFocus}>
            <ButtonGroup className="pb-toolbar-group pb-align-left">
                <FlashButton elementRef={flashButtonRef} />
                <BluetoothButton elementRef={bluetoothButtonRef} />
            </ButtonGroup>
            <ButtonGroup className="pb-toolbar-group pb-align-left">
                <RunButton elementRef={runButtonRef} />
                <StopButton elementRef={stopButtonRef} />
                <ReplButton elementRef={replButtonRef} />
            </ButtonGroup>
        </UtilsToolbar>
    );
};

export default Toolbar;
