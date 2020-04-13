import React from 'react';
import { Connection } from './Connection';

interface ReplProperties {
    readonly connection: React.RefObject<Connection>;
}

class Repl extends React.Component<ReplProperties> {
    constructor(props: ReplProperties) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    private async onClick(): Promise<void> {
        try {
            // send 4 space characters
            await this.props.connection.current?.write(
                new Uint8Array([0x20, 0x20, 0x20, 0x20]),
            );
        } catch (err) {
            alert(err);
        }
    }

    render(): JSX.Element {
        return (
            <button name="connect" onClick={this.onClick}>
                Repl
            </button>
        );
    }
}

export { Repl };
