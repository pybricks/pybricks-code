// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import FileSaver from 'file-saver';
import { select, takeEvery } from 'typed-redux-saga/macro';
import { RootState } from '../reducers';
import {
    EditorActionType,
    EditorOpenAction,
    EditorReloadProgramAction,
    EditorSaveAsAction,
} from './actions';

const decoder = new TextDecoder();

function* open(action: EditorOpenAction): Generator {
    const editor = yield* select((s: RootState) => s.editor.current);

    // istanbul ignore next: it is a bug to dispatch this action with no current editor
    if (editor === null) {
        console.error('open: No current editor');
        return;
    }

    const text = decoder.decode(action.data);
    console.log('open');
    console.log(text);
    console.log(editor);
    //editor.setValue(text);
}

function* saveAs(_action: EditorSaveAsAction): Generator {
    const editor = yield* select((s: RootState) => s.editor.current);

    // istanbul ignore next: it is a bug to dispatch this action with no current editor
    if (editor === null) {
        console.error('saveAs: No current editor');
        return;
    }

    const data = editor.getValue();
    const blob = new Blob([data], { type: 'text/x-python;charset=utf-8' });
    FileSaver.saveAs(blob, 'main.py');
}

function* reloadProgram(_action: EditorReloadProgramAction): Generator {
    const editor = yield* select((s: RootState) => s.editor.current);

    // istanbul ignore next: it is a bug to dispatch this action with no current editor
    if (editor === null) {
        console.error('reloadProgram: No current editor');
        return;
    }

    editor.setValue(localStorage.getItem('program') || '');
}

export default function* (): Generator {
    yield* takeEvery(EditorActionType.Open, open);
    yield* takeEvery(EditorActionType.SaveAs, saveAs);
    yield* takeEvery(EditorActionType.ReloadProgram, reloadProgram);
}
