import React from 'react';
import { Terminal } from 'xterm';

const encoder = new TextEncoder();

type TerminalProps = {
    onData: (data: Uint8Array) => void;
};

export default class TerminalComponent extends React.Component<TerminalProps> {
    private term: Terminal;
    private terminalRef: React.RefObject<HTMLDivElement>;

    constructor(props: TerminalProps) {
        super(props);
        this.term = new Terminal();
        this.terminalRef = React.createRef();
        this.term.onData((data) => this.props.onData(encoder.encode(data)));
    }

    public write(data: Uint8Array): void {
        this.term.write(data);
    }

    componentDidMount(): void {
        if (!this.terminalRef.current) {
            return;
        }
        this.term.open(this.terminalRef.current);
    }

    render(): JSX.Element {
        return (
            <div>
                <div id="terminal" ref={this.terminalRef}></div>
            </div>
        );
    }
}
export { TerminalComponent as Terminal };
