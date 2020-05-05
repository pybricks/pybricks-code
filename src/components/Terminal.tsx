import React from 'react';
import { connect } from 'react-redux';
import ResizeObserver from 'react-resize-observer';
import { Dispatch } from 'redux';
import { Subscription } from 'rxjs';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { receiveData } from '../actions/terminal';
import { terminalOutput } from '../epics/terminal';

import 'xterm/css/xterm.css';

interface DispatchProps {
    onData: (data: string) => void;
}

type TerminalProps = DispatchProps;

class Terminal extends React.Component<TerminalProps> {
    private xterm: XTerm;
    private fitAddon: FitAddon;
    private terminalRef: React.RefObject<HTMLDivElement>;
    private subscription?: Subscription;

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

    componentDidMount(): void {
        if (!this.terminalRef.current) {
            console.error('Missing terminal reference');
            return;
        }
        this.xterm.open(this.terminalRef.current);
        this.fitAddon.fit();
        this.subscription = terminalOutput.subscribe((v) => this.xterm.write(v));
    }

    componentWillUnmount(): void {
        this.subscription?.unsubscribe();
        this.xterm.dispose();
    }

    render(): JSX.Element {
        return (
            <div
                id="terminal"
                ref={this.terminalRef}
                style={{ height: 'inherit', width: 'inherit' }}
            >
                <ResizeObserver onResize={(): void => this.fitAddon.fit()} />
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onData: (d): void => {
        dispatch(receiveData(d));
    },
});

export default connect(null, mapDispatchToProps)(Terminal);
