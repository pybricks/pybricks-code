import React from 'react';
import AceEditor from 'react-ace';
import './App.css';
import { Connection } from './Connection';
import { Terminal } from './Terminal';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';

function onChange(newValue: string): void {
    console.log('change', newValue);
}

function App(): JSX.Element {
    const connection = React.createRef<Connection>();
    const terminal = React.createRef<Terminal>();
    return (
        <div className="App">
            <header className="App-header">
                <Connection
                    onData={(e): void => terminal.current?.write(e)}
                    ref={connection}
                />
            </header>
            <Terminal
                onData={(d): void => connection.current?.write(d)}
                ref={terminal}
            />
            <AceEditor
                mode="python"
                theme="github"
                onChange={onChange}
                name="editor"
                editorProps={{ $blockScrolling: true }}
                width="100%"
            />
        </div>
    );
}

export default App;
