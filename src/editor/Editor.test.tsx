// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import {
    RenderResult,
    fireEvent,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { testRender } from '../../test';
import Editor from './Editor';

function getTextArea(editor: RenderResult): HTMLTextAreaElement {
    // the textarea in ace editor doesn't actually have any contents, but
    // it gets the focus for input.
    return editor.getByDisplayValue('') as HTMLTextAreaElement;
}

it('should focus the text area', () => {
    const [editor] = testRender(<Editor />);

    expect(getTextArea(editor)).toHaveFocus();
});

describe('context menu', () => {
    it('should show the context menu', async () => {
        const [editor] = testRender(<Editor />);

        fireEvent.contextMenu(editor.getByText('Write your program here...'));

        await waitFor(() => {
            expect(editor.getByText('Copy')).toBeInTheDocument();
        });
    });

    it('should hide the context menu when Escape is pressed', async () => {
        const [editor] = testRender(<Editor />);

        fireEvent.contextMenu(editor.getByText('Write your program here...'));

        expect(editor.getByText('Copy')).toBeInTheDocument();

        userEvent.type(editor.getByText('Copy'), '{esc}');

        await waitForElementToBeRemoved(() => editor.queryByText('Copy'));

        // editor should be focused after context menu closes
        expect(document.activeElement).toBe(getTextArea(editor));
    });
});
