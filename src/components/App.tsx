// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import React, { EffectCallback, useEffect, useState } from 'react';
import SplitterLayout from 'react-splitter-layout';
import Editor from './Editor';
import StatusBar from './StatusBar';
import Terminal from './Terminal';
import Toolbar from './Toolbar';

import 'react-splitter-layout/lib/index.css';

function useShowDocs(): boolean {
    function getShowDocs(): boolean {
        return window.innerWidth >= 1024;
    }

    const [showDocs, setShowDocs] = useState(getShowDocs);

    useEffect((): ReturnType<EffectCallback> => {
        function handleResize(): void {
            setShowDocs(getShowDocs());
        }

        window.addEventListener('resize', handleResize);

        return (): void => window.removeEventListener('resize', handleResize);
    }, []); // Empty array ensures that effect is only run on mount and unmount

    return showDocs;
}

function App(): JSX.Element {
    const showDocs = useShowDocs();
    const [dragging, setDragging] = useState(false);

    return (
        <div className="app">
            <Toolbar />
            <SplitterLayout
                customClassName="app-main"
                onDragStart={(): void => setDragging(true)}
                onDragEnd={(): void => setDragging(false)}
                percentage={true}
                secondaryInitialSize={Number(
                    localStorage.getItem('app-main-split') || 30,
                )}
                onSecondaryPaneSizeChange={(value): void =>
                    localStorage.setItem('app-main-split', String(value))
                }
            >
                <SplitterLayout
                    vertical={true}
                    percentage={true}
                    secondaryInitialSize={Number(
                        localStorage.getItem('app-docs-split') || 30,
                    )}
                    onSecondaryPaneSizeChange={(value): void =>
                        localStorage.setItem('app-docs-split', String(value))
                    }
                >
                    <Editor />
                    <div className="terminal-padding">
                        <Terminal />
                    </div>
                </SplitterLayout>
                {showDocs && (
                    <div className="docs-iframe">
                        {dragging && <div className="docs-iframe-overlay" />}
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
        </div>
    );
}

export default App;
