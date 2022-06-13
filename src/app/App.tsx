// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { Classes } from '@blueprintjs/core';
import { getFocusableTreeWalker } from '@react-aria/focus';
import React, {
    FocusEventHandler,
    MouseEventHandler,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import SplitterLayout from 'react-splitter-layout';
import { useLocalStorage, useTernaryDarkMode } from 'usehooks-ts';
import Activities from '../activities/Activities';
import Editor from '../editor/Editor';
import { useSettingIsShowDocsEnabled } from '../settings/hooks';
import StatusBar from '../status-bar/StatusBar';
import Terminal from '../terminal/Terminal';
import Toolbar from '../toolbar/Toolbar';
import { isMacOS } from '../utils/os';
import 'react-splitter-layout/lib/index.css';
import './app.scss';

const Docs: React.VFC = () => {
    const { setIsSettingShowDocsEnabled } = useSettingIsShowDocsEnabled();

    return (
        <iframe
            // REVISIT: some of this could be moved to the docs repo
            // so that it runs earlier to prevent flashing in the UI.
            // The load event doesn't run until after the page is fully
            // loaded and there doesn't seem to be a reasonable way to
            // hook into the iframe to know when it has a new document.
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
                            // Restore the scroll position when the iframe is
                            // shown. Toggling the visibility prevents flashing
                            // the contents from the top of the page before the
                            // scroll is done.
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

                // Have to remove he observer, otherwise we end up with
                // conflicting values when a new page is loaded in the iframe.
                contentWindow.addEventListener('unload', () => {
                    observer.unobserve(target);
                });

                // And this keeps track of the scroll position.
                contentWindow.addEventListener('scroll', () => {
                    if (contentWindow.scrollY !== 0) {
                        // Record the current scroll position. If it is 0, it
                        // could be that the iframe has been hidden or the user
                        // scrolled there. So we have to ignore 0. But we don't
                        // want to be one pixel off if the user really did
                        // scroll there, so we assume that if the last scroll
                        // is 1, then the user probably went all the way to 0.
                        if (contentWindow.scrollY === 1) {
                            iframeScroll = 0;
                        } else {
                            iframeScroll = contentWindow.scrollY;
                        }
                    }
                });

                // Override browser default key bindings in iframe.
                contentWindow.document.addEventListener('keydown', (e) => {
                    // use Ctrl-D/Cmd-D to toggle docs
                    if (
                        (isMacOS()
                            ? e.metaKey && !e.ctrlKey
                            : e.ctrlKey && !e.metaKey) &&
                        !e.altKey &&
                        e.key == 'd'
                    ) {
                        e.preventDefault();
                        // since the iframe is only visible when docs are shown
                        // the only action is to hide the docs
                        setIsSettingShowDocsEnabled(false);
                    }
                });

                if (document.body.classList.contains(Classes.DARK)) {
                    contentWindow.document.documentElement.classList.add(Classes.DARK);
                }
            }}
            src="static/docs/index.html"
            allowFullScreen={true}
            role="documentation"
            width="100%"
            height="100%"
            frameBorder="none"
        />
    );
};

const App: React.VFC = () => {
    const { isDarkMode } = useTernaryDarkMode();
    const { isSettingShowDocsEnabled } = useSettingIsShowDocsEnabled();
    const [isDragging, setIsDragging] = useState(false);

    const [docsSplit, setDocsSplit] = useLocalStorage('app-docs-split', 30);
    const [terminalSplit, setTerminalSplit] = useLocalStorage('app-terminal-split', 30);

    // Classes.DARK has to be applied to body element, otherwise it won't
    // affect portals
    useEffect(() => {
        if (!isDarkMode) {
            // no class for light mode, so nothing to do
            return;
        }

        document.body.classList.add(Classes.DARK);
        return () => document.body.classList.remove(Classes.DARK);
    }, [isDarkMode]);

    useEffect(() => {
        const listener = (e: KeyboardEvent) => {
            // prevent default browser keyboard shortcuts that we use
            // NB: some of these like 'n' and 'w' cannot be prevented when
            // running "in the browser"
            if (e.ctrlKey && ['d', 'n', 's', 'w'].includes(e.key)) {
                e.preventDefault();
            }
        };

        addEventListener('keydown', listener);
        return () => removeEventListener('keydown', listener);
    }, []);

    // keep track of last focused element in the activities area and restore
    // focus to that element if any non-interactive area is clicked

    const lastActivitiesFocusChildRef = useRef<HTMLElement>();

    const handleFocus = useCallback<FocusEventHandler>(
        (e) => {
            if (e.target instanceof HTMLElement) {
                lastActivitiesFocusChildRef.current = e.target;
            }
        },
        [lastActivitiesFocusChildRef],
    );

    const handleActivitiesMouseDown = useCallback<MouseEventHandler<HTMLDivElement>>(
        (e) => {
            if (
                lastActivitiesFocusChildRef.current &&
                e.currentTarget.contains(lastActivitiesFocusChildRef.current)
            ) {
                // if the last focused child exists and it is still inside of
                // the activities area, focus it
                lastActivitiesFocusChildRef.current.focus();
            } else {
                // otherwise, focus the first focusable element
                const walker = getFocusableTreeWalker(e.currentTarget);
                const first = walker.nextNode();

                if (first instanceof HTMLElement) {
                    first.focus();
                }
            }

            // prevent document body from getting focus
            e.stopPropagation();
            e.preventDefault();
        },
        [lastActivitiesFocusChildRef],
    );

    return (
        <div className="pb-app" onContextMenu={(e) => e.preventDefault()}>
            <div className="pb-app-body">
                <div
                    className="pb-app-activities"
                    onFocus={handleFocus}
                    onMouseDown={handleActivitiesMouseDown}
                >
                    <Activities />
                </div>
                {/* need a container with position: relative; for SplitterLayout since it uses position: absolute; */}
                <div className="pb-app-main" style={{ position: 'relative' }}>
                    <SplitterLayout
                        customClassName={
                            isSettingShowDocsEnabled ? 'pb-show-docs' : 'pb-hide-docs'
                        }
                        onDragStart={(): void => setIsDragging(true)}
                        onDragEnd={(): void => setIsDragging(false)}
                        percentage={true}
                        secondaryInitialSize={docsSplit}
                        onSecondaryPaneSizeChange={setDocsSplit}
                    >
                        <SplitterLayout
                            vertical={true}
                            percentage={true}
                            secondaryInitialSize={terminalSplit}
                            onSecondaryPaneSizeChange={setTerminalSplit}
                        >
                            <div className="pb-app-editor">
                                <Toolbar />
                                <Editor />
                            </div>
                            <div className="pb-app-terminal">
                                <Terminal />
                            </div>
                        </SplitterLayout>
                        <div className="pb-app-docs">
                            {isDragging && <div className="pb-app-docs-drag-helper" />}
                            <Docs />
                        </div>
                    </SplitterLayout>
                </div>
            </div>
            <StatusBar />
        </div>
    );
};

export default App;
