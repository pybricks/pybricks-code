import React from 'react';
import AceEditor from 'react-ace';
import './App.css';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';

function onChange(newValue: string): void {
    console.log('change', newValue);
}

function App(): JSX.Element {
    return (
        <div className="App">
            <header className="App-header">
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
            <AceEditor
                mode="python"
                theme="github"
                onChange={onChange}
                name="editor"
                editorProps={{ $blockScrolling: true }}
            />
        </div>
    );
}

export default App;
