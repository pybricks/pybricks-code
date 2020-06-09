// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Ace } from 'ace-builds';
import { select, takeEvery } from 'redux-saga/effects';
import { EditorActionType, EditorReloadProgramAction } from '../actions/editor';
import { RootState } from '../reducers';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function* reloadProgram(_action: EditorReloadProgramAction): Generator {
    const editor = (yield select(
        (s: RootState) => s.editor.current,
    )) as Ace.EditSession;
    editor.setValue(localStorage.getItem('program') || '');
}

export default function* (): Generator {
    yield takeEvery(EditorActionType.ReloadProgram, reloadProgram);
}
