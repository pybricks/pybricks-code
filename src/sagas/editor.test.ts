// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Ace } from 'ace-builds';
import { mock } from 'jest-mock-extended';
import { AsyncSaga } from '../../test';
import { reloadProgram } from '../actions/editor';
import editor from './editor';

test('reloadProgram', async () => {
    const saga = new AsyncSaga(editor);

    const mockEditor = mock<Ace.EditSession>();

    saga.setState({ editor: { current: mockEditor } });
    saga.put(reloadProgram());

    expect(mockEditor.setValue).toHaveBeenCalled();

    await saga.end();
});
