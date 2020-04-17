import React from 'react';
import { Terminal as XTerm } from 'xterm';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { receiveData } from '../actions/terminal';
import { terminalOutput } from '../epics/terminal';
import { Subscription } from 'rxjs';

import 'xterm/css/xterm.css';

interface DispatchProps {
    onData: (data: string) => void;
}

type TerminalProps = DispatchProps;

class Terminal extends React.Component<TerminalProps> {
    private xterm: XTerm;
    private terminalRef: React.RefObject<HTMLDivElement>;
    private subscription?: Subscription;

    constructor(props: TerminalProps) {
        super(props);
        this.xterm = new XTerm({
            cursorBlink: true,
            cursorStyle: 'underline',
            fontSize: 18,
            rows: 8,
            theme: {
                background: 'white',
                foreground: 'black',
                cursor: 'black',
                // transparency is needed to work around https://github.com/xtermjs/xterm.js/issues/2808
                selection: 'rgba(181,213,255,0.5)', // this should match AceEditor theme
            },
        });
        this.xterm.onData((d) => this.props.onData(d));
        this.terminalRef = React.createRef();
    }

    componentDidMount(): void {
        if (!this.terminalRef.current) {
            console.error('Missing terminal reference');
            return;
        }
        this.xterm.open(this.terminalRef.current);
        this.subscription = terminalOutput.subscribe((v) => this.xterm.write(v));
    }

    componentWillUnmount(): void {
        this.subscription?.unsubscribe();
        this.xterm.dispose();
    }

    render(): JSX.Element {
        return (
            <Row className="px-2 py-4 bg-secondary">
                <Col>
                    <div id="terminal" ref={this.terminalRef}></div>
                </Col>
            </Row>
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onData: (d): void => {
        dispatch(receiveData(d));
    },
});

export default connect(null, mapDispatchToProps)(Terminal);
