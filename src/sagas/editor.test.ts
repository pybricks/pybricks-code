// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Ace } from 'ace-builds';
import { mock } from 'jest-mock-extended';
import { AsyncSaga } from '../../test';
import { open, reloadProgram, saveAs } from '../actions/editor';
import editor from './editor';

jest.mock('ace-builds');
jest.mock('file-saver');

test('open', async () => {
    const saga = new AsyncSaga(editor);
    const mockEditor = mock<Ace.EditSession>();
    const data = new Uint8Array().buffer;

    saga.setState({ editor: { current: mockEditor } });
    saga.put(open(data));

    expect(mockEditor.setValue).toBeCalled();

    await saga.end();
});

test('saveAs', async () => {
    const saga = new AsyncSaga(editor);
    const mockEditor = mock<Ace.EditSession>();

    saga.setState({ editor: { current: mockEditor } });
    saga.put(saveAs());

    expect(mockEditor.getValue).toBeCalled();

    await saga.end();
});

test('reloadProgram', async () => {
    const saga = new AsyncSaga(editor);
    const mockEditor = mock<Ace.EditSession>();

    saga.setState({ editor: { current: mockEditor } });
    saga.put(reloadProgram());

    expect(mockEditor.setValue).toHaveBeenCalled();

    await saga.end();
});
