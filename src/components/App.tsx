import React from 'react';
import Container from 'react-bootstrap/Container';
import Editor from './Editor';
import StatusBar from './Statusbar';
import Terminal from './Terminal';
import Toolbar from './Toolbar';

function App(): JSX.Element {
    return (
        <Container fluid>
            <Toolbar />
            <Editor />
            <Terminal />
            <StatusBar />
        </Container>
    );
}

export default App;
