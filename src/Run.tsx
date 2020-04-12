import React from 'react';
import AceEditor from 'react-ace';
import MpyCross from '@pybricks/mpy-cross';
import { Connection } from './Connection';

const mpy = MpyCross({ arguments: ['-mno-unicode'] });

interface RunProperties {
    readonly editor: React.RefObject<AceEditor>;
    readonly connection: React.RefObject<Connection>;
}

class Run extends React.Component<RunProperties> {
    constructor(props: RunProperties) {
        super(props);
        this.onClick = this.onClick.bind(this);
    }
    private async onClick(): Promise<void> {
        try {
            const session = this.props.editor.current?.editor.getSession();
            const document = session.getDocument();
            const data = mpy.compile(document.getValue());
            await this.props.connection.current?.downloadAndRun(data);
        } catch (err) {
            alert(err);
        }
    }

    render(): JSX.Element {
        return (
            <button name="connect" onClick={this.onClick}>
                Run
            </button>
        );
    }
}

export { Run };
