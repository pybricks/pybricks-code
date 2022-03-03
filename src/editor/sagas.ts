// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import FileSaver from 'file-saver';
import { call, getContext, put, takeEvery } from 'typed-redux-saga/macro';
import { ensureError } from '../utils';
import { EditorType } from './Editor';
import { didFailToSaveAs, didSaveAs, open, saveAs } from './actions';

/**
 * Partial saga context type for context used in the editor sagas.
 */
export type EditorSagaContext = { editor: EditorType };

const decoder = new TextDecoder();

function* handleOpen(action: ReturnType<typeof open>): Generator {
    const editor = yield* getContext<EditorType>('editor');

    // istanbul ignore next: it is a bug to dispatch this action with no current editor
    if (editor === null) {
        console.error('open: No current editor');
        return;
    }

    const text = decoder.decode(action.data);
    editor.setValue(text);
}

function* handleSaveAs(): Generator {
    const editor = yield* getContext<EditorType>('editor');

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

export default function* (): Generator {
    yield* takeEvery(open, handleOpen);
    yield* takeEvery(saveAs, handleSaveAs);
}
