// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { RenderResult, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender } from '../../../test';
import { Toolbar } from './Toolbar';
import { ToolbarButton } from './ToolbarButton';

afterEach(() => {
    cleanup();
});

const TestToolbar: React.VoidFunctionComponent = () => {
    return (
        <Toolbar
            className="test-class"
            aria-label="Test Toolbar"
            firstFocusableItemId="button1"
        >
            <ToolbarButton id="button1" aria-label="Button 1" />
            <ToolbarButton id="button2" aria-label="Button 2" />
            <ToolbarButton id="button3" aria-label="Button 3" />
        </Toolbar>
    );
};

function getButtons(toolbar: RenderResult): {
    button1: HTMLElement;
    button2: HTMLElement;
    button3: HTMLElement;
} {
    const button1 = toolbar.getByRole('button', { name: 'Button 1' });
    const button2 = toolbar.getByRole('button', { name: 'Button 2' });
    const button3 = toolbar.getByRole('button', { name: 'Button 3' });

    return { button1, button2, button3 };
}

describe('Toolbar', () => {
    it('should have toolbar role', () => {
        const [toolbar] = testRender(<TestToolbar />);

        expect(toolbar.getByRole('toolbar', { name: 'Test Toolbar' })).toHaveClass(
            'test-class',
        );
    });

    it('should focus the first element by default', async () => {
        const [toolbar] = testRender(<TestToolbar />);

        const { button1, button2, button3 } = getButtons(toolbar);

        expect(button1).not.toHaveAttribute('tabindex');
        expect(button2).toHaveAttribute('tabindex', '-1');
        expect(button3).toHaveAttribute('tabindex', '-1');

        userEvent.tab();

        expect(button1).toHaveFocus();
        expect(button1).not.toHaveAttribute('tabindex');
        expect(button2).toHaveAttribute('tabindex', '-1');
        expect(button3).toHaveAttribute('tabindex', '-1');
    });

    it('should focus next with right arrow key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        const { button1, button2, button3 } = getButtons(toolbar);

        button1.focus();
        userEvent.keyboard('[ArrowRight]');

        expect(button2).toHaveFocus();
        expect(button1).toHaveAttribute('tabindex', '-1');
        expect(button2).not.toHaveAttribute('tabindex');
        expect(button3).toHaveAttribute('tabindex', '-1');
    });

    it('should focus previous with left arrow key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        const { button1, button2, button3 } = getButtons(toolbar);

        button3.focus();
        userEvent.keyboard('[ArrowLeft]');

        expect(button2).toHaveFocus();
        expect(button1).toHaveAttribute('tabindex', '-1');
        expect(button2).not.toHaveAttribute('tabindex');
        expect(button3).toHaveAttribute('tabindex', '-1');
    });

    it('should wrap focus next with right arrow key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        const { button1, button2, button3 } = getButtons(toolbar);

        button3.focus();
        userEvent.keyboard('[ArrowRight]');

        expect(button1).toHaveFocus();
        expect(button1).not.toHaveAttribute('tabindex');
        expect(button2).toHaveAttribute('tabindex', '-1');
        expect(button3).toHaveAttribute('tabindex', '-1');
    });

    it('should wrap focus previous with left arrow key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        const { button1, button2, button3 } = getButtons(toolbar);

        button1.focus();
        userEvent.keyboard('[ArrowLeft]');

        expect(button3).toHaveFocus();
        expect(button1).toHaveAttribute('tabindex', '-1');
        expect(button2).toHaveAttribute('tabindex', '-1');
        expect(button3).not.toHaveAttribute('tabindex');
    });

    it('should focus first with home key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        const { button1, button2, button3 } = getButtons(toolbar);

        button3.focus();
        userEvent.keyboard('[Home]');

        expect(button1).toHaveFocus();
        expect(button1).not.toHaveAttribute('tabindex');
        expect(button2).toHaveAttribute('tabindex', '-1');
        expect(button3).toHaveAttribute('tabindex', '-1');
    });

    it('should focus last with end key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        const { button1, button2, button3 } = getButtons(toolbar);

        button1.focus();
        userEvent.keyboard('[End]');

        expect(button3).toHaveFocus();
        expect(button1).toHaveAttribute('tabindex', '-1');
        expect(button2).toHaveAttribute('tabindex', '-1');
        expect(button3).not.toHaveAttribute('tabindex');
    });

    it('should not change focus with up arrow key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        const { button1, button2, button3 } = getButtons(toolbar);

        button2.focus();
        userEvent.keyboard('[ArrowUp]');

        expect(button2).toHaveFocus();
        expect(button1).toHaveAttribute('tabindex', '-1');
        expect(button2).not.toHaveAttribute('tabindex');
        expect(button3).toHaveAttribute('tabindex', '-1');
    });

    it('should not change focus with down arrow key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        const { button1, button2, button3 } = getButtons(toolbar);

        button2.focus();
        userEvent.keyboard('[ArrowDown]');

        expect(button2).toHaveFocus();
        expect(button1).toHaveAttribute('tabindex', '-1');
        expect(button2).not.toHaveAttribute('tabindex');
        expect(button3).toHaveAttribute('tabindex', '-1');
    });

    it('should not focus next item with tab key', () => {
        const [toolbar] = testRender(<TestToolbar />);

        const { button1, button2, button3 } = getButtons(toolbar);

        button2.focus();
        userEvent.tab();

        expect(document.body).toHaveFocus();
        expect(button1).toHaveAttribute('tabindex', '-1');
        expect(button2).not.toHaveAttribute('tabindex');
        expect(button3).toHaveAttribute('tabindex', '-1');
    });

    it('should focus on click', () => {
        const [toolbar] = testRender(<TestToolbar />);

        const { button1, button2, button3 } = getButtons(toolbar);

        userEvent.click(button2);

        expect(button2).toHaveFocus();
        expect(button1).toHaveAttribute('tabindex', '-1');
        expect(button2).not.toHaveAttribute('tabindex');
        expect(button3).toHaveAttribute('tabindex', '-1');
    });
});
