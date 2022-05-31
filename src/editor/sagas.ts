// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { monaco } from 'react-monaco-editor';
import { EventChannel, buffers, eventChannel } from 'redux-saga';
import {
    SagaGenerator,
    call,
    delay,
    fork,
    getContext,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import { UUID } from '../fileStorage';
import {
    fileStorageDidFailToLoadTextFile,
    fileStorageDidInitialize,
    fileStorageDidLoadTextFile,
    fileStorageLoadTextFile,
    fileStorageStoreTextFileValue,
    fileStorageStoreTextFileViewState,
} from '../fileStorage/actions';
import { RootState } from '../reducers';
import { acquireLock, defined, ensureError } from '../utils';
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
import { EditorError } from './error';
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
        yield* put(fileStorageStoreTextFileValue(model.uri.path as UUID, value));
        // failures are ignored

        // throttle the writes so we don't do it too often while user is typing quickly
        yield* delay(ms);
    }
}

function* handleEditorOpenFile(
    editor: monaco.editor.ICodeEditor,
    openFiles: OpenFileManager,
    action: ReturnType<typeof editorOpenFile>,
): Generator {
    let closeRequested = false;

    try {
        const defer: Array<() => void | Promise<void>> = [];

        try {
            const modelUri = monaco.Uri.from({
                scheme: 'pybricksCode',
                path: action.uuid,
            });

            const releaseLock = yield* call(() =>
                acquireLock(`pybricks.editor+${modelUri}`),
            );

            if (!releaseLock) {
                throw new EditorError(
                    'FileInUse',
                    'the file is already open in another editor',
                );
            }

            defer.push(releaseLock);

            yield* put(fileStorageLoadTextFile(action.uuid));

            const { didLoad, didFailToLoad } = yield* race({
                didLoad: take(
                    fileStorageDidLoadTextFile.when((a) => a.uuid === action.uuid),
                ),
                didFailToLoad: take(
                    fileStorageDidFailToLoadTextFile.when(
                        (a) => a.uuid === action.uuid,
                    ),
                ),
            });

            if (didFailToLoad) {
                throw didFailToLoad.error;
            }

            defined(didLoad);

            const model = monaco.editor.createModel(
                didLoad.value,
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

            openFiles.add(action.uuid, model, didLoad.viewState);
            defer.push(() => openFiles.remove(action.uuid));

            yield* put(editorDidOpenFile(action.uuid));

            yield* take(editorCloseFile.when((a) => a.uuid === action.uuid));

            closeRequested = true;

            // if the file is the currently active file, the view state will
            // be out of sync, so we need to update it here before saving to
            // storage
            if (editor.getModel() === model) {
                openFiles.updateViewState(action.uuid, editor.saveViewState());
            }

            // save the file contents and view state on close
            yield* put(fileStorageStoreTextFileValue(action.uuid, model.getValue()));
            yield* put(
                fileStorageStoreTextFileViewState(
                    action.uuid,
                    openFiles.get(action.uuid)?.viewState ?? null,
                ),
            );
        } finally {
            for (const callback of defer.reverse()) {
                callback();
            }

            // only send the did close action if the corresponding action requested it
            if (closeRequested) {
                yield* put(editorDidCloseFile(action.uuid));
            }
        }
    } catch (err) {
        yield* put(editorDidFailToOpenFile(action.uuid, ensureError(err)));
    }
}

function* handleEditorActivateFile(
    editor: monaco.editor.ICodeEditor,
    openFiles: OpenFileManager,
    activeFileHistory: ActiveFileHistoryManager,
    action: ReturnType<typeof editorActivateFile>,
): Generator {
    try {
        if (!openFiles.has(action.uuid)) {
            yield* put(editorOpenFile(action.uuid));

            const { didFailToOpen } = yield* race({
                didOpen: take(editorDidOpenFile.when((a) => a.uuid == action.uuid)),
                didFailToOpen: take(
                    editorDidFailToOpenFile.when((a) => a.uuid == action.uuid),
                ),
            });

            if (didFailToOpen) {
                throw didFailToOpen.error;
            }
        }

        const file = openFiles.get(action.uuid);

        // istanbul ignore if: this should always be available after editorDidOpenFile
        if (file === undefined) {
            throw new Error('bug: could not get file from openFiles');
        }

        // save the current view state for later activation
        const oldModel = editor.getModel();

        if (oldModel) {
            openFiles.updateViewState(
                oldModel.uri.path as UUID,
                editor.saveViewState(),
            );
        }

        editor.setModel(file.model);
        editor.restoreViewState(file.viewState);
        activeFileHistory.push(action.uuid);

        yield* put(editorDidActivateFile(action.uuid));
    } catch (err) {
        yield* put(editorDidFailToActivateFile(action.uuid, ensureError(err)));
    }
}

function* handleEditorDidCloseFile(
    activeFileHistory: ActiveFileHistoryManager,
    action: ReturnType<typeof editorDidCloseFile>,
): Generator {
    // handleEditorOpenFile handles most of the closing of files.
    // Here we only need to handle removing the closed file from the active
    // file history.

    const newActiveFile = activeFileHistory.pop(action.uuid);

    // if the closed file was the active file, we need to activate a new file
    // otherwise there will be no active file
    if (newActiveFile) {
        yield* put(editorActivateFile(newActiveFile));
    }
}

/**
 * Monitor browser document visibility and save active file if visibility is lost.
 */
function* monitorDocumentVisibility(editor: monaco.editor.ICodeEditor): Generator {
    const ch = eventChannel<Event>((emit) => {
        // document visibility is the most reliable way to monitor end of "session".
        // https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
        document.addEventListener('visibilitychange', emit);
        return () => document.removeEventListener('visibilitychange', emit);
    });

    try {
        for (;;) {
            yield* take(ch);

            if (document.visibilityState !== 'hidden') {
                // remove the backup so that we don't risk writing over newer
                // data with older data from the backup
                sessionStorage.removeItem('editor.backup');
                continue;
            }

            const model = editor.getModel();

            if (!model) {
                continue;
            }

            // This is a last-ditch effort to save the user state when the page
            // "closes" (reload, background on mobile, etc.). We can't write to
            // indexeddb here since it is async and won't complete the transaction
            // before the page stops running.
            try {
                sessionStorage.setItem(
                    'editor.backup',
                    JSON.stringify({
                        uuid: model.uri.path,
                        value: model.getValue(),
                        viewState: editor.saveViewState(),
                    }),
                );
            } catch (err) {
                // istanbul ignore next: not critical if this fails
                console.error(err);
            }
        }
    } finally {
        ch.close();
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
    yield* takeEvery(editorOpenFile, handleEditorOpenFile, editor, openFiles);
    yield* takeEvery(
        editorActivateFile,
        handleEditorActivateFile,
        editor,
        openFiles,
        activeFileHistory,
    );
    yield* takeEvery(editorDidCloseFile, handleEditorDidCloseFile, activeFileHistory);
    yield* fork(monitorDocumentVisibility, editor);

    yield* put(editorDidCreate());

    const backup = (() => {
        try {
            const item = sessionStorage.getItem('editor.backup');

            if (!item) {
                return null;
            }

            sessionStorage.removeItem('editor.backup');

            return JSON.parse(item);
        } catch {
            return null;
        }
    })();

    // this should restore all previously open files in the same order
    // the were last used (which may be different from the order in which
    // they were originally opened)
    for (const item of activeFileHistory.getFromStorage()) {
        yield* put(editorActivateFile(item));

        const { didActivate } = yield* race({
            didActivate: take(editorDidActivateFile.when((a) => a.uuid === item)),
            didFailToActivate: take(
                editorDidFailToActivateFile.when((a) => a.uuid === item),
            ),
        });

        if (didActivate && didActivate.uuid === backup.uuid) {
            if (backup.value) {
                try {
                    editor.getModel()?.setValue(backup.value);
                } catch (err) {
                    // istanbul ignore next: not critical if this fails
                    console.error(err);
                }
            }

            if (backup.viewState) {
                try {
                    editor.restoreViewState(backup.viewState);
                } catch (err) {
                    // istanbul ignore next: not critical if this fails
                    console.error(err);
                }
            }
        }
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
