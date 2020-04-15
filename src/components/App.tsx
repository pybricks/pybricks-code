import React from 'react';
import Editor from './Editor';
import Toolbar from './Toolbar';
import Container from 'react-bootstrap/Container';

function App(): JSX.Element {
    return (
        <Container fluid>
            <Toolbar />
            <Editor />
        </Container>
    );
}

export default App;
