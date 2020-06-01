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
            <Container fluid>
                <Row className="vh-100">
                    <Col md={12} lg={8} className="d-flex flex-column container-col">
                        <Row>
                            <Col>
                                <Toolbar />
                            </Col>
                        </Row>
                        <Row className="row flex-grow-1">
                            <Col>
                                <Editor />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="terminal py-2">
                                <Terminal />
                            </Col>
                        </Row>
                        <Row className="mt-2">
                            <Col>
                                <StatusBar />
                            </Col>
                        </Row>
                    </Col>
                    <Col lg={4} className="embed-responsive d-lg-block d-md-none">
                        <iframe src="https://docs.pybricks.com" title="docs"></iframe>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default App;
