// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { Menu, MenuDivider, MenuItem, ResizeSensor } from '@blueprintjs/core';
import { ContextMenu2, ContextMenu2ContentProps } from '@blueprintjs/popover2';
import { useI18n } from '@shopify/react-i18n';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTernaryDarkMode } from 'usehooks-ts';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { isMacOS } from '../utils/os';
import { TerminalContext } from './TerminalContext';
import { receiveData } from './actions';
import { I18nId } from './i18n';

import 'xterm/css/xterm.css';

function handleKeyEvent(event: KeyboardEvent): boolean {
    if (
        event.key === 'v' &&
        event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey &&
        !event.metaKey
    ) {
        // this allows CTRL+V to be handled by the browser instead of sending
        // a control character to the terminal.
        return false;
    }

    if (event.key === 'F5' || event.key === 'F6') {
        // allow global handler for these keys
        return false;
    }

    return true;
}

function createXTerm(): { xterm: XTerm; fitAddon: FitAddon } {
    const xterm = new XTerm({
        cursorBlink: true,
        cursorStyle: 'underline',
        fontSize: 18,
    });
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    xterm.attachCustomKeyEventHandler(handleKeyEvent);

    return { xterm, fitAddon };
}

function createContextMenu(
    xterm: XTerm,
): (props: ContextMenu2ContentProps) => JSX.Element {
    const contextMenu = (_props: ContextMenu2ContentProps): JSX.Element => {
        // istanbul ignore next: babel-loader rewrites this line
        const [i18n] = useI18n();

        return (
            <Menu>
                <MenuItem
                    onClick={(): void => {
                        const selected = xterm.getSelection();
                        if (selected) {
                            navigator.clipboard.writeText(selected);
                        }
                    }}
                    text={i18n.translate(I18nId.Copy)}
                    icon="duplicate"
                    label={isMacOS() ? 'Cmd-C' : 'Ctrl-Shift-C'}
                    disabled={!xterm.hasSelection()}
                />
                <MenuItem
                    onClick={async (): Promise<void> => {
                        xterm.paste(await navigator.clipboard.readText());
                    }}
                    text={i18n.translate(I18nId.Paste)}
                    icon="clipboard"
                    label={isMacOS() ? 'Cmd-V' : 'Ctrl-V'}
                />
                <MenuItem
                    onClick={() => xterm.selectAll()}
                    text={i18n.translate(I18nId.SelectAll)}
                    icon="blank"
                />
                <MenuDivider />
                <MenuItem
                    onClick={(): void => xterm.clear()}
                    text={i18n.translate(I18nId.Clear)}
                    icon="trash"
                />
            </Menu>
        );
    };

    return contextMenu;
}

const Terminal: React.FC = (_props) => {
    const { xterm, fitAddon } = useMemo(createXTerm, [createXTerm]);
    const terminalRef = useRef<HTMLDivElement>(null);
    const { isDarkMode } = useTernaryDarkMode();
    const dispatch = useDispatch();
    const terminalStream = useContext(TerminalContext);

    // xterm.open() has to be called after terminalRef has been rendered
    useEffect(() => {
        // istanbul ignore if: should not happen ever
        if (!terminalRef.current) {
            console.error('Missing terminal reference');
            return;
        }

        xterm.open(terminalRef.current);
        fitAddon.fit();

        // HACK: remove tabindex from main xterm element, otherwise it takes
        // two tabs to get to the text area
        xterm.element?.removeAttribute('tabindex');

        return () => xterm.dispose();
    }, [xterm]);

    // wire up isDarkMode to terminal
    useEffect(() => {
        xterm.options.theme = {
            background: isDarkMode ? 'black' : 'white',
            foreground: isDarkMode ? 'white' : 'black',
            cursor: isDarkMode ? 'white' : 'black',
            // transparency is needed to work around https://github.com/xtermjs/xterm.js/issues/2808
            selection: isDarkMode ? 'rgb(81,81,81,0.5)' : 'rgba(181,213,255,0.5)', // this should match AceEditor theme
        };
    }, [isDarkMode]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            // implement CTRL+SHIFT+C keyboard shortcut for copying text from terminal
            if (e.key === 'C' && e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey) {
                // this would otherwise open up debug console in web browser
                e.preventDefault();

                if (
                    document.hasFocus() &&
                    document.activeElement ===
                        terminalRef.current?.getElementsByClassName(
                            'xterm-helper-textarea',
                        )[0] &&
                    xterm.hasSelection()
                ) {
                    navigator.clipboard.writeText(xterm.getSelection());
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [terminalRef, xterm]);

    // wire shared context to terminal output
    useEffect(() => {
        const subscription = terminalStream.dataSource.observable.subscribe({
            next: (d) => xterm.write(d),
        });

        return () => subscription.unsubscribe();
    }, [terminalStream]);

    // wire terminal input to actions
    useEffect(() => {
        const onDataHandle = xterm.onData((d) => dispatch(receiveData(d)));
        return () => onDataHandle.dispose();
    }, [dispatch]);

    const contextMenu = useMemo(
        () => createContextMenu(xterm),
        [createContextMenu, xterm],
    );

    return (
        <ContextMenu2
            className="h-100"
            content={contextMenu}
            popoverProps={{ onClosed: () => xterm.focus() }}
        >
            <ResizeSensor onResize={(): void => fitAddon.fit()}>
                <div ref={terminalRef} className="h-100" />
            </ResizeSensor>
        </ContextMenu2>
    );
};

export default Terminal;
