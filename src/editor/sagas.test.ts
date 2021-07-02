// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { mock } from 'jest-mock-extended';
import { monaco } from 'react-monaco-editor';
import { AsyncSaga } from '../../test';
import { open, reloadProgram, saveAs } from './actions';
import editor from './sagas';

jest.mock('react-monaco-editor');
jest.mock('file-saver');

test('open', async () => {
    const mockEditor = mock<monaco.editor.ICodeEditor>();
    const saga = new AsyncSaga(editor, { editor: { current: mockEditor } });

    const data = new Uint8Array().buffer;
    saga.put(open(data));

    expect(mockEditor.setValue).toBeCalled();

    await saga.end();
});

test('saveAs', async () => {
    const mockEditor = mock<monaco.editor.ICodeEditor>();
    const saga = new AsyncSaga(editor, { editor: { current: mockEditor } });

    saga.put(saveAs());

    expect(mockEditor.getValue).toBeCalled();

    await saga.end();
});

test('reloadProgram', async () => {
    const mockEditor = mock<monaco.editor.ICodeEditor>();
    const saga = new AsyncSaga(editor, { editor: { current: mockEditor } });

    saga.put(reloadProgram());

    expect(mockEditor.setValue).toHaveBeenCalled();

    await saga.end();
});
