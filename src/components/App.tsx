import React from 'react';
import Editor from './Editor';
import Toolbar from './Toolbar';
import Terminal from './Terminal';
import Container from 'react-bootstrap/Container';

function App(): JSX.Element {
    return (
        <Container fluid>
            <Toolbar />
            <Editor />
            <Terminal />
        </Container>
    );
}

export default App;
