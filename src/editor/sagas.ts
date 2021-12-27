// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import FileSaver from 'file-saver';
import { call, put, select, takeEvery } from 'typed-redux-saga/macro';
import { RootState } from '../reducers';
import { ensureError } from '../utils';
import {
    EditorActionType,
    EditorOpenAction,
    EditorReloadProgramAction,
    EditorSaveAsAction,
    didFailToSaveAs,
    didSaveAs,
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
    editor.setValue(text);
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

    if (window.showSaveFilePicker) {
        // This uses https://wicg.github.io/file-system-access which is not
        // available in all browsers
        try {
            const handle = yield* call(() =>
                window.showSaveFilePicker({
                    suggestedName: 'main.py',
                    types: [
                        {
                            accept: { 'text/x-python': '.py' },
                            // TODO: translate description
                            description: 'Python Files',
                        },
                    ],
                }),
            );

            const writeable = yield* call(() => handle.createWritable());
            yield* call(() => writeable.write(blob));
            yield* call(() => writeable.close());
        } catch (err) {
            yield* put(didFailToSaveAs(ensureError(err)));
            return;
        }
    } else {
        // this is a fallback to use the standard browser download mechanism
        try {
            FileSaver.saveAs(blob, 'main.py');
        } catch (err) {
            yield* put(didFailToSaveAs(ensureError(err)));
            return;
        }
    }

    yield* put(didSaveAs());
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
