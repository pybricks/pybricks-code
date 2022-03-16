// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { ButtonGroup } from '@blueprintjs/core';
import React, { useState } from 'react';
import FlashButton from '../firmware/FlashButton';
import BluetoothButton from '../hub/BluetoothButton';
import ReplButton from '../hub/ReplButton';
import RunButton from '../hub/RunButton';
import StopButton from '../hub/StopButton';
import SettingsButton from '../settings/SettingsButton';
import SettingsDrawer from '../settings/SettingsDrawer';
import { preventBrowserNativeContextMenu } from '../utils/react';

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
                <FlashButton label="Flash" />
                <BluetoothButton label="Bluetooth" />
            </ButtonGroup>
            <ButtonGroup className="pb-toolbar-group pb-align-left">
                <RunButton label="Run" keyboardShortcut="F5" />
                <StopButton label="Stop" keyboardShortcut="F6" />
                <ReplButton label="REPL" />
            </ButtonGroup>
            <ButtonGroup className="pb-toolbar-group pb-align-right">
                <SettingsButton
                    label="Settings"
                    onAction={() => setIsSettingsDrawerOpen(true)}
                />
                <SettingsDrawer
                    isOpen={isSettingsDrawerOpen}
                    onClose={() => setIsSettingsDrawerOpen(false)}
                />
            </ButtonGroup>
        </div>
    );
};

export default Toolbar;
