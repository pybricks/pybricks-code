// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import SplitterLayout from 'react-splitter-layout';
import { RootState } from '../reducers';
import Editor from './Editor';
import SettingsDrawer from './SettingsDrawer';
import StatusBar from './StatusBar';
import Terminal from './Terminal';
import Toolbar from './Toolbar';

import 'react-splitter-layout/lib/index.css';
import './app.scss';

function App(): JSX.Element {
    const showDocs = useSelector((s: RootState): boolean => s.settings.showDocs);
    const [dragging, setDragging] = useState(false);

    return (
        <div className="app">
            <Toolbar />
            <SplitterLayout
                customClassName="h-body"
                onDragStart={(): void => setDragging(true)}
                onDragEnd={(): void => setDragging(false)}
                percentage={true}
                secondaryInitialSize={Number(
                    localStorage.getItem('app-docs-split') || 30,
                )}
                onSecondaryPaneSizeChange={(value): void =>
                    localStorage.setItem('app-docs-split', String(value))
                }
            >
                <SplitterLayout
                    vertical={true}
                    percentage={true}
                    secondaryInitialSize={Number(
                        localStorage.getItem('app-terminal-split') || 30,
                    )}
                    onSecondaryPaneSizeChange={(value): void =>
                        localStorage.setItem('app-terminal-split', String(value))
                    }
                >
                    <Editor />
                    <div className="terminal-padding h-100">
                        <Terminal />
                    </div>
                </SplitterLayout>
                {showDocs && (
                    <div className="h-100 w-100">
                        {dragging && <div className="h-100 w-100 p-absolute" />}
                        <iframe
                            src="https://docs.pybricks.com"
                            allowFullScreen={true}
                            title="docs"
                            width="100%"
                            height="100%"
                            frameBorder="none"
                        />
                    </div>
                )}
            </SplitterLayout>
            <StatusBar />
            <SettingsDrawer />
        </div>
    );
}

export default App;
