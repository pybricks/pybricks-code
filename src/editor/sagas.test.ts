// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Ace } from 'ace-builds';
import { mock } from 'jest-mock-extended';
import { AsyncSaga } from '../../test';
import { open, reloadProgram, saveAs } from './actions';
import editor from './sagas';

jest.mock('ace-builds');
jest.mock('file-saver');

test('open', async () => {
    const mockEditor = mock<Ace.EditSession>();
    const saga = new AsyncSaga(editor, { editor: { current: mockEditor } });

    const data = new Uint8Array().buffer;
    saga.put(open(data));

    expect(mockEditor.setValue).toBeCalled();

    await saga.end();
});

test('saveAs', async () => {
    const mockEditor = mock<Ace.EditSession>();
    const saga = new AsyncSaga(editor, { editor: { current: mockEditor } });

    saga.put(saveAs());

    expect(mockEditor.getValue).toBeCalled();

    await saga.end();
});

test('reloadProgram', async () => {
    const mockEditor = mock<Ace.EditSession>();
    const saga = new AsyncSaga(editor, { editor: { current: mockEditor } });

    saga.put(reloadProgram());

    expect(mockEditor.setValue).toHaveBeenCalled();

    await saga.end();
});
