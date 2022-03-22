// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { ButtonGroup } from '@blueprintjs/core';
import React, { useState } from 'react';
import SettingsDrawer from '../settings/SettingsDrawer';
import { preventBrowserNativeContextMenu } from '../utils/react';
import BluetoothButton from './buttons/bluetooth/BluetoothButton';
import FlashButton from './buttons/flash/FlashButton';
import ReplButton from './buttons/repl/ReplButton';
import RunButton from './buttons/run/RunButton';
import SettingsButton from './buttons/settings/SettingsButton';
import StopButton from './buttons/stop/StopButton';

import './toolbar.scss';

const Toolbar: React.VFC = (_props) => {
    const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);

    return (
        <div
            role="toolbar"
            onContextMenu={preventBrowserNativeContextMenu}
            className="pb-toolbar"
        >
            <ButtonGroup className="pb-toolbar-group pb-align-left">
                <FlashButton />
                <BluetoothButton />
            </ButtonGroup>
            <ButtonGroup className="pb-toolbar-group pb-align-left">
                <RunButton />
                <StopButton />
                <ReplButton />
            </ButtonGroup>
            <ButtonGroup className="pb-toolbar-group pb-align-right">
                <SettingsButton onAction={() => setIsSettingsDrawerOpen(true)} />
                <SettingsDrawer
                    isOpen={isSettingsDrawerOpen}
                    onClose={() => setIsSettingsDrawerOpen(false)}
                />
            </ButtonGroup>
        </div>
    );
};

export default Toolbar;
