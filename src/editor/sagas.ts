// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { monaco } from 'react-monaco-editor';
import { EventChannel, buffers, eventChannel } from 'redux-saga';
import {
    SagaGenerator,
    delay,
    fork,
    getContext,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import {
    fileStorageDidFailToReadFile,
    fileStorageDidInitialize,
    fileStorageDidReadFile,
    fileStorageReadFile,
    fileStorageWriteFile,
} from '../fileStorage/actions';
import { RootState } from '../reducers';
import { defined, ensureError } from '../utils';
import {
    editorActivateFile,
    editorCloseFile,
    editorDidActivateFile,
    editorDidCloseFile,
    editorDidCreate,
    editorDidFailToActivateFile,
    editorDidFailToOpenFile,
    editorDidOpenFile,
    editorGetValueRequest,
    editorGetValueResponse,
    editorOpenFile,
} from './actions';
import { ActiveFileHistoryManager, OpenFileManager } from './lib';
import { pybricksMicroPythonId } from './pybricksMicroPython';

/**
 * Saga that gets the current value from the editor.
 * @returns The value.
 * @throws Error if editor.isReady state is false.
 */
export function* editorGetValue(): SagaGenerator<string> {
    const nextMessageId = yield* getContext<() => number>('nextMessageId');

    const isReady = yield* select((s: RootState) => s.editor.isReady);

    if (!isReady) {
        throw new Error('editorGetValue() called before editor.isReady');
    }

    const request = yield* put(editorGetValueRequest(nextMessageId()));
    const response = yield* take(
        editorGetValueResponse.when((a) => a.id === request.id),
    );

    return response.value;
}

function* handleEditorGetValueRequest(
    editor: monaco.editor.ICodeEditor,
    action: ReturnType<typeof editorGetValueRequest>,
): Generator {
    yield* put(editorGetValueResponse(action.id, editor.getValue()));
}

/** Handle changes to the model. */
function* handleModelDidChange(
    ms: number,
    chan: EventChannel<monaco.editor.IModelContentChangedEvent>,
    model: monaco.editor.ITextModel,
): Generator {
    for (;;) {
        yield* take(chan);
        const value = model.getValue();
        // when the model changes, save it to storage.
        yield* put(fileStorageWriteFile(model.uri.fsPath, value));
        // failures are ignored

        // throttle the writes so we don't do it too often while user is typing quickly
        yield* delay(ms);
    }
}

function* handleEditorOpenFile(
    openFiles: OpenFileManager,
    action: ReturnType<typeof editorOpenFile>,
): Generator {
    let closeRequested = false;

    try {
        const defer: Array<() => void> = [];

        try {
            const modelUri = monaco.Uri.from({
                scheme: 'pybricksCode',
                path: action.fileName,
            });

            yield* put(fileStorageReadFile(modelUri.fsPath));

            const { didRead, didFailToRead } = yield* race({
                didRead: take(
                    fileStorageDidReadFile.when((a) => a.path === action.fileName),
                ),
                didFailToRead: take(
                    fileStorageDidFailToReadFile.when(
                        (a) => a.path === action.fileName,
                    ),
                ),
            });

            if (didFailToRead) {
                throw didFailToRead.error;
            }

            defined(didRead);

            const model = monaco.editor.createModel(
                didRead.contents,
                pybricksMicroPythonId,
                modelUri,
            );
            defer.push(() => model.dispose());

            // NB: the throttle effect doesn't work with event channels, so we
            // emulate the effect by using a buffer with size of one here...
            const didChangeModelChan =
                eventChannel<monaco.editor.IModelContentChangedEvent>((emit) => {
                    const subscription = model.onDidChangeContent((e) => emit(e));
                    return () => subscription.dispose();
                }, buffers.sliding(1));

            defer.push(() => didChangeModelChan.close());

            // ... and then fork to function that looks like
            // https://github.com/redux-saga/redux-saga/issues/620#issuecomment-259161095
            yield* fork(handleModelDidChange, 1000, didChangeModelChan, model);

            // TODO: get viewState from fileStorage

            openFiles.add(action.fileName, model, null);
            defer.push(() => openFiles.remove(action.fileName));

            yield* put(editorDidOpenFile(action.fileName));

            yield* take(editorCloseFile.when((a) => a.fileName === action.fileName));

            closeRequested = true;
        } finally {
            for (const callback of defer.reverse()) {
                callback();
            }

            // only send the did close action if the corresponding action requested it
            if (closeRequested) {
                yield* put(editorDidCloseFile(action.fileName));
            }
        }
    } catch (err) {
        yield* put(editorDidFailToOpenFile(action.fileName, ensureError(err)));
    }
}

function* handleEditorActivateFile(
    editor: monaco.editor.ICodeEditor,
    openFiles: OpenFileManager,
    activeFileHistory: ActiveFileHistoryManager,
    action: ReturnType<typeof editorActivateFile>,
): Generator {
    try {
        if (!openFiles.has(action.fileName)) {
            yield* put(editorOpenFile(action.fileName));

            const { didFailToOpen } = yield* race({
                didOpen: take(
                    editorDidOpenFile.when((a) => a.fileName == action.fileName),
                ),
                didFailToOpen: take(
                    editorDidFailToOpenFile.when((a) => a.fileName == action.fileName),
                ),
            });

            if (didFailToOpen) {
                throw didFailToOpen.error;
            }
        }

        const file = openFiles.get(action.fileName);

        // istanbul ignore if: this should always be available after editorDidOpenFile
        if (file === undefined) {
            throw new Error('bug: could not get file from openFiles');
        }

        // save the current view state for later activation
        const activeFile = editor.getModel()?.uri?.path ?? '';
        openFiles.updateViewState(activeFile, editor.saveViewState());
        // TODO: save viewState to fileStorage

        editor.setModel(file.model);
        editor.restoreViewState(file.viewState);
        activeFileHistory.push(action.fileName);

        yield* put(editorDidActivateFile(action.fileName));
    } catch (err) {
        yield* put(editorDidFailToActivateFile(action.fileName, ensureError(err)));
    }
}

function* handleEditorDidCloseFile(
    activeFileHistory: ActiveFileHistoryManager,
    action: ReturnType<typeof editorDidCloseFile>,
): Generator {
    // handleEditorOpenFile handles most of the closing of files.
    // Here we only need to handle removing the closed file from the active
    // file history.

    const newActiveFile = activeFileHistory.pop(action.fileName);

    // if the closed file was the active file, we need to activate a new file
    // otherwise there will be no active file
    if (newActiveFile) {
        yield* put(editorActivateFile(newActiveFile));
    }
}

function* handleDidCreateEditor(editor: monaco.editor.ICodeEditor): Generator {
    // first, we need to be sure that file storage is ready

    const isFileStorageInitialized = yield* select(
        (s: RootState) => s.fileStorage.isInitialized,
    );

    if (!isFileStorageInitialized) {
        yield* take(fileStorageDidInitialize);
    }

    const openFiles = new OpenFileManager();
    const activeFileHistory = new ActiveFileHistoryManager(editor.getId());

    yield* takeEvery(editorGetValueRequest, handleEditorGetValueRequest, editor);
    yield* takeEvery(editorOpenFile, handleEditorOpenFile, openFiles);
    yield* takeEvery(
        editorActivateFile,
        handleEditorActivateFile,
        editor,
        openFiles,
        activeFileHistory,
    );
    yield* takeEvery(editorDidCloseFile, handleEditorDidCloseFile, activeFileHistory);

    yield* put(editorDidCreate());

    // this should restore all previously open files in the same order
    // the were last used (which may be different from the order in which
    // they were originally opened)
    for (const item of activeFileHistory.getFromStorage()) {
        yield* put(editorActivateFile(item));
    }
}

function* monitorEditors(): Generator {
    const ch = eventChannel<monaco.editor.ICodeEditor>((emit) => {
        const subscription = monaco.editor.onDidCreateEditor(emit);
        return () => subscription.dispose();
    });

    try {
        yield* takeEvery(ch, handleDidCreateEditor);

        yield* take('__never__');
    } finally {
        ch.close();
    }
}

export default function* (): Generator {
    yield* fork(monitorEditors);
}
