// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import React from 'react';
import { testRender } from '../../test';
import Toolbar from './Toolbar';

describe('toolbar', () => {
    it('should have bluetooth button', () => {
        const [toolbar] = testRender(<Toolbar />);

        const runButton = toolbar.getByRole('button', { name: 'Bluetooth' });

        expect(runButton).toBeDefined();
    });

    it('should have flash button', () => {
        const [toolbar] = testRender(<Toolbar />);

        const runButton = toolbar.getByRole('button', { name: 'Flash' });

        expect(runButton).toBeDefined();
    });

    it('should have run button', () => {
        const [toolbar] = testRender(<Toolbar />);

        const runButton = toolbar.getByRole('button', { name: 'Run' });

        expect(runButton).toBeDefined();
    });

    it('should have stop button', () => {
        const [toolbar] = testRender(<Toolbar />);

        const runButton = toolbar.getByRole('button', { name: 'Stop' });

        expect(runButton).toBeDefined();
    });

    it('should have repl button', () => {
        const [toolbar] = testRender(<Toolbar />);

        const runButton = toolbar.getByRole('button', { name: 'REPL' });

        expect(runButton).toBeDefined();
    });
});
