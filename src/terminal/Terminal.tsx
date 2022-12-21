// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import 'xterm/css/xterm.css';
import './terminal.scss';
import { Menu, MenuDivider, MenuItem, ResizeSensor } from '@blueprintjs/core';
import { ContextMenu2, ContextMenu2ContentProps } from '@blueprintjs/popover2';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTernaryDarkMode } from 'usehooks-ts';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { isMacOS } from '../utils/os';
import { TerminalContext } from './TerminalContext';
import { receiveData } from './actions';
import { useI18n } from './i18n';

// Source: https://freesound.org/people/altemark/sounds/45759/
// This sound is released under the Creative Commons Attribution 3.0 Unported
// (CC BY 3.0) license. It was created by 'altemark'. No modifications have been
// made, apart from the conversion to base64.
const BELL_SOUND =
    'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjMyLjEwNAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTRUoAWgBgkOAGbZHBgG1OF6zM82DWbZaUmMBptgQhGjsyYqc9ae9XFz280948NMBWInljyzsNRFLPWdnZGWrddDsjK1unuSrVN9jJsK8KuQtQCtMBjCEtImISdNKJOopIpBFpNSMbIHCSRpRR5iakjTiyzLhchUUBwCgyKiweBv/7UsQbg8isVNoMPMjAAAA0gAAABEVFGmgqK////9bP/6XCykxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';

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
    const ContextMenu = (_props: ContextMenu2ContentProps): JSX.Element => {
        const i18n = useI18n();

        return (
            <Menu>
                <MenuItem
                    onClick={(): void => {
                        const selected = xterm.getSelection();
                        if (selected) {
                            navigator.clipboard.writeText(selected);
                        }
                    }}
                    text={i18n.translate('copy')}
                    icon="duplicate"
                    label={isMacOS() ? 'Cmd-C' : 'Ctrl-Shift-C'}
                    disabled={!xterm.hasSelection()}
                />
                <MenuItem
                    onClick={async (): Promise<void> => {
                        xterm.paste(await navigator.clipboard.readText());
                    }}
                    text={i18n.translate('paste')}
                    icon="clipboard"
                    label={isMacOS() ? 'Cmd-V' : 'Ctrl-V'}
                />
                <MenuItem
                    onClick={() => xterm.selectAll()}
                    text={i18n.translate('selectAll')}
                    icon="blank"
                />
                <MenuDivider />
                <MenuItem
                    onClick={(): void => xterm.clear()}
                    text={i18n.translate('clear')}
                    icon="trash"
                />
            </Menu>
        );
    };

    return ContextMenu;
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

        // HACK: remove terminal from keyboard tab focus
        // Since it steals tab key presses, there is no way
        // to get out of it, so we use landmark navigation instead.
        xterm.element?.removeAttribute('tabindex');
        xterm.textarea?.setAttribute('tabindex', '-1');

        return () => xterm.dispose();
    }, [xterm, fitAddon]);

    // wire up isDarkMode to terminal
    useEffect(() => {
        xterm.options.theme = {
            background: isDarkMode ? 'black' : 'white',
            foreground: isDarkMode ? 'white' : 'black',
            cursor: isDarkMode ? 'white' : 'black',
            // transparency is needed to work around https://github.com/xtermjs/xterm.js/issues/2808
            selectionBackground: isDarkMode
                ? 'rgb(81,81,81,0.5)'
                : 'rgba(181,213,255,0.5)', // this should match editor theme
        };
    }, [isDarkMode, xterm]);

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
    }, [terminalStream, xterm]);

    // wire terminal input to actions
    useEffect(() => {
        const onDataHandle = xterm.onData((d) => dispatch(receiveData(d)));
        return () => onDataHandle.dispose();
    }, [dispatch, xterm]);

    const contextMenu = useMemo(() => createContextMenu(xterm), [xterm]);

    useEffect(() => {
        const listener = () => {
            xterm.focus();
        };

        addEventListener('pb-terminal-focus', listener);

        return () => removeEventListener('pb-terminal-focus', listener);
    }, [xterm]);

    // audio and visual notification of bell

    const bellRef = useRef<HTMLAudioElement>(null);
    const bellOverlayRef = useRef<HTMLDivElement>(null);
    const bellTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        const audioElement = bellRef.current;
        const overlayElement = bellOverlayRef.current;

        if (process.env.NODE_ENV === 'test' || !audioElement || !overlayElement) {
            return;
        }

        const subscription = xterm.onBell(() => {
            if (bellTimeoutRef.current) {
                clearTimeout(bellTimeoutRef.current);
            }

            audioElement.play();
            overlayElement.classList.add('pb-bell');

            bellTimeoutRef.current = setTimeout(() => {
                overlayElement.classList.remove('pb-bell');
            }, 150);
        });

        return () => subscription.dispose();
    }, [xterm, bellRef, bellOverlayRef, bellTimeoutRef]);

    return (
        <ContextMenu2
            className="h-100"
            content={contextMenu}
            popoverProps={{ onClosed: () => xterm.focus() }}
        >
            <audio hidden preload="auto" ref={bellRef}>
                <source src={BELL_SOUND} />
            </audio>
            <div className="pb-terminal-bell-overlay" ref={bellOverlayRef} />
            <ResizeSensor onResize={(): void => fitAddon.fit()}>
                <div ref={terminalRef} className="h-100" />
            </ResizeSensor>
        </ContextMenu2>
    );
};

export default Terminal;
