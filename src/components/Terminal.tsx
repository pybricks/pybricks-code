// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { ResizeSensor } from '@blueprintjs/core';
import React from 'react';
import { connect } from 'react-redux';
import { Observable, Unsubscribe } from 'redux';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { Dispatch } from '../actions';
import { receiveData } from '../actions/terminal';
import { RootState } from '../reducers';

import 'xterm/css/xterm.css';

interface StateProps {
    dataSource: Observable<string> | null;
}

interface DispatchProps {
    onData: (data: string) => void;
}

type TerminalProps = StateProps & DispatchProps;

class Terminal extends React.Component<TerminalProps> {
    private xterm: XTerm;
    private fitAddon: FitAddon;
    private terminalRef: React.RefObject<HTMLDivElement>;
    private subscription?: { unsubscribe: Unsubscribe };

    constructor(props: TerminalProps) {
        super(props);
        this.xterm = new XTerm({
            cursorBlink: true,
            cursorStyle: 'underline',
            fontSize: 18,
            theme: {
                background: 'white',
                foreground: 'black',
                cursor: 'black',
                // transparency is needed to work around https://github.com/xtermjs/xterm.js/issues/2808
                selection: 'rgba(181,213,255,0.5)', // this should match AceEditor theme
            },
        });
        this.fitAddon = new FitAddon();
        this.xterm.loadAddon(this.fitAddon);
        this.xterm.onData((d) => this.props.onData(d));
        this.terminalRef = React.createRef();
    }

    private handleKeyDownEvent = (e: KeyboardEvent): void => {
        // implement CTRL+SHIFT+C keyboard shortcut for copying text from terminal
        if (e.key === 'C' && e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey) {
            // this would otherwise open up debug console in web browser
            e.preventDefault();

            if (
                document.hasFocus() &&
                document.activeElement ===
                    this.terminalRef.current?.getElementsByClassName(
                        'xterm-helper-textarea',
                    )[0] &&
                this.xterm.hasSelection()
            ) {
                navigator.clipboard.writeText(this.xterm.getSelection());
            }
        }
    };

    componentDidMount(): void {
        if (!this.terminalRef.current) {
            console.error('Missing terminal reference');
            return;
        }
        this.xterm.open(this.terminalRef.current);
        this.fitAddon.fit();
        this.subscription = this.props.dataSource?.subscribe({
            next: (d) => this.xterm.write(d),
        });
        window.addEventListener('keydown', this.handleKeyDownEvent);
    }

    componentWillUnmount(): void {
        window.removeEventListener('keydown', this.handleKeyDownEvent);
        this.subscription?.unsubscribe();
        this.xterm.dispose();
    }

    render(): JSX.Element {
        return (
            <ResizeSensor onResize={(): void => this.fitAddon.fit()}>
                <div
                    ref={this.terminalRef}
                    className="h-100"
                    onContextMenu={(e): void => e.preventDefault()}
                />
            </ResizeSensor>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    dataSource: state.terminal.dataSource,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onData: (d): void => {
        dispatch(receiveData(d));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Terminal);
