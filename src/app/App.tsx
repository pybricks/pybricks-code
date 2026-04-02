// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2026 The Pybricks Authors

import './app.scss';
import { Button, Classes, Spinner } from '@blueprintjs/core';
import { Console, Manual } from '@blueprintjs/icons';
import React, { useEffect } from 'react';
import {
    Panel,
    Group as PanelGroup,
    Separator as PanelResizeHandle,
} from 'react-resizable-panels';
import { useTernaryDarkMode } from 'usehooks-ts';
import Activities from '../activities/Activities';
import DfuWindowsDriverInstallDialog from '../firmware/dfuWindowsDriverInstallDialog/DfuWindowsDriverInstallDialog';
import { InstallPybricksDialog } from '../firmware/installPybricksDialog/InstallPybricksDialog';
import RestoreOfficialDialog from '../firmware/restoreOfficialDialog/RestoreOfficialDialog';
import SponsorDialog from '../sponsor/SponsorDialog';
import StatusBar from '../status-bar/StatusBar';
import Toolbar from '../toolbar/Toolbar';
import Tour from '../tour/Tour';
import { docsDefaultPage } from './constants';
import { useCollapsiblePanel } from './hooks';
import { useI18n } from './i18n';

const Editor = React.lazy(async () => {
    const [sagaModule, componentModule] = await Promise.all([
        import('../editor/sagas'),
        import('../editor/Editor'),
    ]);

    window.dispatchEvent(
        new CustomEvent('pb-lazy-saga', { detail: { saga: sagaModule.default } }),
    );

    return componentModule;
});

const Terminal = React.lazy(async () => {
    const [sagaModule, componentModule] = await Promise.all([
        import('../terminal/sagas'),
        import('../terminal/Terminal'),
    ]);

    window.dispatchEvent(
        new CustomEvent('pb-lazy-saga', { detail: { saga: sagaModule.default } }),
    );

    return componentModule;
});

const Docs: React.FunctionComponent = () => {
    return (
        <iframe
            onLoad={(e) => {
                const target = e.target as HTMLIFrameElement;
                const contentWindow = target.contentWindow;
                if (!contentWindow) {
                    console.error('could not get iframe content window');
                    return;
                }

                if (document.body.classList.contains(Classes.DARK)) {
                    contentWindow.document.documentElement.classList.add(Classes.DARK);
                }
            }}
            src={docsDefaultPage}
            allowFullScreen={true}
            width="100%"
            height="100%"
        />
    );
};

const App: React.FunctionComponent = () => {
    const i18n = useI18n();
    const { isDarkMode } = useTernaryDarkMode();

    const docs = useCollapsiblePanel(false, 30);
    const terminal = useCollapsiblePanel(true, 20);

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

    const sideViewButtons = (
        <div className="pb-app-side-view-buttons">
            <Button
                large
                intent="primary"
                icon={<Console />}
                title={
                    terminal.visible
                        ? i18n.translate('terminal.hide')
                        : i18n.translate('terminal.show')
                }
                onClick={() => terminal.setVisible(!terminal.visible)}
            />
            <Button
                large
                intent="primary"
                icon={<Manual />}
                title={
                    docs.visible
                        ? i18n.translate('docs.hide')
                        : i18n.translate('docs.show')
                }
                onClick={() => docs.setVisible(!docs.visible)}
            />
        </div>
    );

    return (
        <div className="pb-app" onContextMenu={(e) => e.preventDefault()}>
            <div className="pb-app-body">
                <PanelGroup
                    orientation="horizontal"
                    resizeTargetMinimumSize={{ coarse: 37, fine: 26 }}
                >
                    <Panel id="main-app">
                        <div className="pb-app-main">
                            <Toolbar />
                            <div className="pb-app-body-inner">
                                <aside
                                    className="pb-app-activities"
                                    aria-label={i18n.translate('landmark.activities')}
                                >
                                    <Activities />
                                </aside>
                                <PanelGroup
                                    orientation="vertical"
                                    resizeTargetMinimumSize={{ coarse: 37, fine: 26 }}
                                >
                                    <Panel>
                                        <div className="pb-app-editor-area">
                                            <PanelGroup orientation="horizontal">
                                                <Panel>
                                                    <main
                                                        className="pb-app-editor"
                                                        aria-label={i18n.translate(
                                                            'landmark.editor',
                                                        )}
                                                    >
                                                        <React.Suspense
                                                            fallback={
                                                                <Spinner className="pb-editor" />
                                                            }
                                                        >
                                                            <Editor />
                                                        </React.Suspense>
                                                    </main>
                                                </Panel>
                                            </PanelGroup>
                                            {sideViewButtons}
                                        </div>
                                    </Panel>
                                    <PanelResizeHandle
                                        disabled={!terminal.visible}
                                        className={
                                            terminal.visible
                                                ? 'pb-splitter pb-splitter--horizontal'
                                                : undefined
                                        }
                                    />
                                    <Panel
                                        id="terminal"
                                        collapsible
                                        collapsedSize="0%"
                                        minSize="10%"
                                        panelRef={terminal.panelRef}
                                        onResize={terminal.onResize}
                                    >
                                        <aside
                                            className="pb-app-terminal"
                                            aria-label={i18n.translate(
                                                'landmark.terminal',
                                            )}
                                        >
                                            <React.Suspense
                                                fallback={<Spinner className="h-100" />}
                                            >
                                                <Terminal />
                                            </React.Suspense>
                                        </aside>
                                    </Panel>
                                </PanelGroup>
                            </div>
                        </div>
                    </Panel>
                    <PanelResizeHandle
                        disabled={!docs.visible}
                        className={
                            docs.visible
                                ? 'pb-splitter pb-splitter--vertical'
                                : undefined
                        }
                    />
                    <Panel
                        id="docs"
                        collapsible
                        collapsedSize="0%"
                        minSize="10%"
                        panelRef={docs.panelRef}
                        onResize={docs.onResize}
                    >
                        <aside
                            className="pb-app-side-panel"
                            aria-label={i18n.translate('landmark.documentation')}
                        >
                            <Docs />
                        </aside>
                    </Panel>
                </PanelGroup>
            </div>
            <StatusBar />
            <Tour />
            <DfuWindowsDriverInstallDialog />
            <InstallPybricksDialog />
            <RestoreOfficialDialog />
            <SponsorDialog />
        </div>
    );
};

export default App;
