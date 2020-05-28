// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import React from 'react';
import { Col, Row } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Editor from './Editor';
import StatusBar from './StatusBar';
import Terminal from './Terminal';
import Toolbar from './Toolbar';

function App(): JSX.Element {
    return (
        <div>
            <Container fluid className="vh-100 d-flex flex-column">
                <Row>
                    <Col>
                        <Toolbar />
                    </Col>
                </Row>
                <Row className="h-100">
                    <Col>
                        <Editor />
                    </Col>
                </Row>
                <Row>
                    <Col className="Terminal py-2">
                        <Terminal />
                    </Col>
                </Row>
                <Row className="mt-2">
                    <Col>
                        <StatusBar />
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default App;
