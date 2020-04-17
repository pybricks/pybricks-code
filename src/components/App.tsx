import React from 'react';
import Container from 'react-bootstrap/Container';
import Editor from './Editor';
import Toolbar from './Toolbar';
import Terminal from './Terminal';
import StatusBar from './Statusbar';

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
