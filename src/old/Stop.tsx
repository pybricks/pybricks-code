import React from 'react';
import { Connection } from './Connection';

interface StopProperties {
    readonly connection: React.RefObject<Connection>;
}

class Stop extends React.Component<StopProperties> {
    constructor(props: StopProperties) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    private async onClick(): Promise<void> {
        try {
            // send CTRL+C, CTRL+C, CTRL+D
            await this.props.connection.current?.write(
                new Uint8Array([0x03, 0x03, 0x04]),
            );
        } catch (err) {
            alert(err);
        }
    }

    render(): JSX.Element {
        return (
            <button name="connect" onClick={this.onClick}>
                Stop
            </button>
        );
    }
}

export { Stop };
