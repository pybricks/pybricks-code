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
        <div
            className="position-fixed"
            style={{ width: '100%', height: 'calc(100% - 0px)' }}
        >
            <Container>
                <Row>
                    <Col>
                        <Toolbar />
                    </Col>
                </Row>
                <Row>
                    <Col className="py-2">
                        <Editor />
                    </Col>
                </Row>
                <Row>
                    <Col style={{ height: '25vh' }} className="py-2">
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
