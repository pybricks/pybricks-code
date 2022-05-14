// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useRef } from 'react';
import { testRender } from '../../test';
import Toolbar from './Toolbar';
import { useRovingTabIndex } from './react';

afterEach(() => {
    cleanup();
});

const TestToolbar: React.VoidFunctionComponent = () => {
    const button1Ref = useRef<HTMLButtonElement>(null);
    const button2Ref = useRef<HTMLButtonElement>(null);
    const button3Ref = useRef<HTMLButtonElement>(null);

    const moveFocus = useRovingTabIndex(button1Ref, button2Ref, button3Ref);

    return (
        <Toolbar onKeyboard={moveFocus}>
            <button data-testid="button1" ref={button1Ref} />
            <button data-testid="button2" ref={button2Ref} />
            <button data-testid="button3" ref={button3Ref} />
        </Toolbar>
    );
};

describe('useRovingTabIndex', () => {
    it('should focus the first element by default', async () => {
        const [toolbar] = testRender(<TestToolbar />);

        const button1 = toolbar.getByTestId('button1');
        const button2 = toolbar.getByTestId('button2');
        const button3 = toolbar.getByTestId('button3');

        () => expect(button1).toHaveAttribute('tabindex', '0');
        () => expect(button2).toHaveAttribute('tabindex', '-1');
        () => expect(button3).toHaveAttribute('tabindex', '-1');

        userEvent.tab();

        expect(button1).toHaveFocus();
    });

    it('should focus next with right arrow key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        toolbar.getByTestId('button1').focus();
        userEvent.keyboard('[ArrowRight]');

        expect(toolbar.getByTestId('button2')).toHaveFocus();
    });

    it('should focus previous with left arrow key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        toolbar.getByTestId('button3').focus();
        userEvent.keyboard('[ArrowLeft]');

        expect(toolbar.getByTestId('button2')).toHaveFocus();
    });

    it('should wrap focus next with right arrow key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        toolbar.getByTestId('button3').focus();
        userEvent.keyboard('[ArrowRight]');

        expect(toolbar.getByTestId('button1')).toHaveFocus();
    });

    it('should wrap focus previous with left arrow key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        toolbar.getByTestId('button1').focus();
        userEvent.keyboard('[ArrowLeft]');

        expect(toolbar.getByTestId('button3')).toHaveFocus();
    });

    it('should focus first with home key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        toolbar.getByTestId('button3').focus();
        userEvent.keyboard('[Home]');

        expect(toolbar.getByTestId('button1')).toHaveFocus();
    });

    it('should focus last with end key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        toolbar.getByTestId('button1').focus();
        userEvent.keyboard('[End]');

        expect(toolbar.getByTestId('button3')).toHaveFocus();
    });

    it('should not change focus with up arrow key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        toolbar.getByTestId('button2').focus();
        userEvent.keyboard('[ArrowUp]');

        expect(toolbar.getByTestId('button2')).toHaveFocus();
    });

    it('should not change focus with down arrow key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        toolbar.getByTestId('button2').focus();
        userEvent.keyboard('[ArrowDown]');

        expect(toolbar.getByTestId('button2')).toHaveFocus();
    });
});
