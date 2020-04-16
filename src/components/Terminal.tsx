import React from 'react';
import { Terminal as XTerm } from 'xterm';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import 'xterm/css/xterm.css';

class Terminal extends React.Component {
    private xterm: XTerm;
    private terminalRef: React.RefObject<HTMLDivElement>;

    constructor(props: {}) {
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
        this.xterm.onData((data) => this.xterm.write(data));
        this.terminalRef = React.createRef();
    }

    componentDidMount(): void {
        if (!this.terminalRef.current) {
            console.error('Missing terminal reference');
            return;
        }
        this.xterm.open(this.terminalRef.current);
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

export default Terminal;
