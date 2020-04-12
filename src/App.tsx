import React from 'react';
import AceEditor from 'react-ace';
import './App.css';
import { Connection } from './Connection';
import { Terminal } from './Terminal';
import { Run } from './Run';
import { Flash } from './Flash';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';

function App(): JSX.Element {
    const connection = React.createRef<Connection>();
    const terminal = React.createRef<Terminal>();
    const editor = React.createRef<AceEditor>();
    return (
        <div className="App">
            <header className="App-header">
                <Connection
                    onData={(e): void => terminal.current?.write(e)}
                    ref={connection}
                />
                <Run connection={connection} editor={editor} />
                <Flash />
            </header>
            <Terminal
                onData={(d): void => {
                    connection.current?.write(d);
                }}
                ref={terminal}
            />
            <AceEditor
                mode="python"
                theme="github"
                name="editor"
                editorProps={{ $blockScrolling: true }}
                width="100%"
                ref={editor}
            />
        </div>
    );
}

export default App;
