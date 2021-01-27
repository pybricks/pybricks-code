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
                customClassName={`h-body ${showDocs ? 'pb-show-docs' : 'pb-hide-docs'}`}
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
                <div className="h-100 w-100">
                    {dragging && <div className="h-100 w-100 p-absolute" />}
                    <iframe
                        onLoad={(e) => {
                            // HACK: this mess restores the scroll position when
                            // the documentation iframe visibility is toggled.
                            // The iframe will be automatically scrolled to 0 when
                            // CSS `display: none` is set.

                            const target = e.target as HTMLIFrameElement;
                            const contentWindow = target.contentWindow;
                            if (!contentWindow) {
                                console.error('could not get iframe content window');
                                return;
                            }

                            // the last "good" scrollY value of the iframe
                            let iframeScroll = 0;

                            // This bit monitors the visibility.
                            // https://stackoverflow.com/a/44670818/1976323
                            const observer = new IntersectionObserver(
                                (entries) => {
                                    entries.forEach((entry) => {
                                        // Restore the scroll position when the
                                        // iframe is shown. Toggling the visibility
                                        // prevents flashing the contents from the
                                        // top of the page before the scroll is
                                        // done.
                                        if (entry.intersectionRatio > 0) {
                                            contentWindow.scrollTo(0, iframeScroll);
                                            contentWindow.document.documentElement.style.visibility =
                                                'visible';
                                        } else {
                                            contentWindow.document.documentElement.style.visibility =
                                                'hidden';
                                        }
                                    });
                                },
                                {
                                    root: target.parentElement,
                                },
                            );

                            observer.observe(target);

                            // Have to remove he observer, otherwise we end up
                            // with conflicting values when a new page is loaded
                            // in the iframe.
                            contentWindow.addEventListener('unload', () => {
                                observer.unobserve(target);
                            });

                            // And this keeps track of the scroll position.
                            contentWindow.addEventListener('scroll', () => {
                                if (contentWindow.scrollY !== 0) {
                                    // Record the current scroll position.
                                    // If it is 0, it could be that the iframe
                                    // has been hidden or the user scrolled
                                    // there. So we have to ignore 0. But we
                                    // don't want to be one pixel off if the
                                    // user really did scroll there, so we
                                    // assume that if the last scroll is 1, then
                                    // the user probably went all the way to 0.
                                    if (contentWindow.scrollY === 1) {
                                        iframeScroll = 0;
                                    } else {
                                        iframeScroll = contentWindow.scrollY;
                                    }
                                }
                            });
                        }}
                        src="static/docs/index.html"
                        allowFullScreen={true}
                        title="docs"
                        width="100%"
                        height="100%"
                        frameBorder="none"
                    />
                </div>
            </SplitterLayout>
            <StatusBar />
            <SettingsDrawer />
        </div>
    );
}

export default App;
