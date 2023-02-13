// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import type { DatabaseChangeType, IDatabaseChange } from 'dexie-observable/api';
import * as monaco from 'monaco-editor';
import { EventChannel, buffers, eventChannel } from 'redux-saga';
import {
    call,
    cancelled,
    delay,
    fork,
    getContext,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import { alertsShowAlert } from '../alerts/actions';
import { FileStorageDb, UUID } from '../fileStorage';
import {
    fileStorageDidFailToLoadTextFile,
    fileStorageDidFailToStoreTextFileViewState,
    fileStorageDidInitialize,
    fileStorageDidLoadTextFile,
    fileStorageDidStoreTextFileViewState,
    fileStorageLoadTextFile,
    fileStorageStoreTextFileValue,
    fileStorageStoreTextFileViewState,
} from '../fileStorage/actions';
import {
    pythonMessageComplete,
    pythonMessageDeleteUserFile,
    pythonMessageDidComplete,
    pythonMessageDidFailToComplete,
    pythonMessageDidFailToGetSignature,
    pythonMessageDidFailToInit,
    pythonMessageDidGetSignature,
    pythonMessageDidInit,
    pythonMessageDidMountUserFileSystem,
    pythonMessageGetSignature,
    pythonMessageInit,
    pythonMessageSetInterruptBuffer,
    pythonMessageWriteUserFile,
} from '../pybricksMicropython/python-message';
import { RootState } from '../reducers';
import { acquireLock, defined, ensureError } from '../utils';
import { createCountFunc } from '../utils/iter';
import {
    editorActivateFile,
    editorCloseFile,
    editorCompletionDidFailToInit,
    editorCompletionDidInit,
    editorCompletionInit,
    editorDidActivateFile,
    editorDidCloseFile,
    editorDidCreate,
    editorDidFailToActivateFile,
    editorDidFailToOpenFile,
    editorDidOpenFile,
    editorGetValueRequest,
    editorGetValueResponse,
    editorGoto,
    editorOpenFile,
} from './actions';
import { EditorError } from './error';
import { ActiveFileHistoryManager, OpenFileManager } from './lib';
import { pybricksMicroPythonId } from './pybricksMicroPython';

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

            // save the file contents on close since the change watcher is
            // throttled and the latest changes may not have been saved yet
            yield* put(fileStorageStoreTextFileValue(action.uuid, model.getValue()));
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
                didOpen: take(editorDidOpenFile.when((a) => a.uuid === action.uuid)),
                didFailToOpen: take(
                    editorDidFailToOpenFile.when((a) => a.uuid === action.uuid),
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

function* handleEditorGoto(
    editor: monaco.editor.ICodeEditor,
    action: ReturnType<typeof editorGoto>,
): Generator {
    yield* put(editorActivateFile(action.uuid));

    const { didActivate, didFailToActivate } = yield* race({
        didActivate: take(editorDidActivateFile.when((a) => a.uuid === action.uuid)),
        didFailToActivate: take(
            editorDidFailToActivateFile.when((a) => a.uuid === action.uuid),
        ),
    });

    if (didFailToActivate) {
        if (
            didFailToActivate.error instanceof EditorError &&
            didFailToActivate.error.name === 'FileInUse'
        ) {
            const db = yield* getContext<FileStorageDb>('fileStorage');

            const metadata = yield* call(() => db.metadata.get(action.uuid));

            yield* put(
                alertsShowAlert('explorer', 'fileInUse', {
                    fileName: metadata?.path ?? '<unknown>',
                }),
            );
        } else {
            yield* put(
                alertsShowAlert('alerts', 'unexpectedError', {
                    error: didFailToActivate.error,
                }),
            );
        }

        return;
    }

    defined(didActivate);

    editor.revealLineInCenterIfOutsideViewport(action.line);
    editor.setSelection({
        startColumn: 1,
        startLineNumber: action.line,
        endColumn: Infinity,
        endLineNumber: action.line,
    });
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
 * Monitors the editor for any possible view state change and stores the state
 * with the associated file when the state changes.
 */
function* monitorViewState(editor: monaco.editor.ICodeEditor): Generator {
    const ch = eventChannel<
        | monaco.editor.ICursorPositionChangedEvent
        | monaco.editor.ICursorSelectionChangedEvent
        | monaco.IScrollEvent
    >((emit) => {
        const subscriptions = new Array<monaco.IDisposable>();

        // there isn't a single view state change event, so this should be
        // all of the events that can trigger a state change
        subscriptions.push(editor.onDidChangeCursorPosition(emit));
        subscriptions.push(editor.onDidChangeCursorSelection(emit));
        subscriptions.push(editor.onDidScrollChange(emit));

        return () => subscriptions.forEach((s) => s.dispose());
    }, buffers.sliding(1));

    try {
        for (;;) {
            yield* take(ch);

            const model = editor.getModel();

            if (!model) {
                continue;
            }

            const uuid = model.uri.path as UUID;

            yield* put(fileStorageStoreTextFileViewState(uuid, editor.saveViewState()));

            yield* race({
                didStore: take(
                    fileStorageDidStoreTextFileViewState.when((a) => a.uuid === uuid),
                ),
                didFailToStore: take(
                    fileStorageDidFailToStoreTextFileViewState.when(
                        (a) => a.uuid === uuid,
                    ),
                ),
            });
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
    yield* takeEvery(editorGoto, handleEditorGoto, editor);
    yield* takeEvery(editorDidCloseFile, handleEditorDidCloseFile, activeFileHistory);
    yield* fork(monitorViewState, editor);

    yield* put(editorDidCreate());

    // this should restore all previously open files in the same order
    // the were last used (which may be different from the order in which
    // they were originally opened)
    for (const item of activeFileHistory.getFromStorage()) {
        yield* put(editorActivateFile(item));

        yield* race({
            didActivate: take(editorDidActivateFile.when((a) => a.uuid === item)),
            didFailToActivate: take(
                editorDidFailToActivateFile.when((a) => a.uuid === item),
            ),
        });

        // Errors are ignored here since we don't want to pester the user with
        // error messages.
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

// HACK: dexie-observable exports const enum, so we have to redefine values
const DatabaseChangeTypeCreate: DatabaseChangeType.Create = 1;
const DatabaseChangeTypeUpdate: DatabaseChangeType.Update = 2;
const DatabaseChangeTypeDelete: DatabaseChangeType.Delete = 3;

/**
 * Mirrors the Dexie-based file system to the Emscripten file system in the
 * Python Web Worker.
 *
 * @param worker The web worker.
 */
function* mirrorFileSystem(worker: Worker): Generator {
    // wait for file storage to become ready if it isn't already
    if (!(yield* select((s: RootState) => s.fileStorage.isInitialized))) {
        yield take(fileStorageDidInitialize);
    }

    const db = yield* getContext<FileStorageDb>('fileStorage');

    // subscribe to future changes
    const dbChangedChan = eventChannel<IDatabaseChange[]>((emit) => {
        db.on('changes').subscribe(emit);
        return () => db.on('changes').unsubscribe(emit);
    });

    // copy all existing files
    yield* call(() =>
        db.transaction('r', db._contents, () =>
            db._contents.each((f) =>
                worker.postMessage(pythonMessageWriteUserFile(f.path, f.contents)),
            ),
        ),
    );

    // handle future changes
    try {
        for (;;) {
            const changes = yield* take(dbChangedChan);

            for (const c of changes) {
                // only interested in metadata table changes
                if (c.table !== db.metadata.name) {
                    continue;
                }

                switch (c.type) {
                    case DatabaseChangeTypeCreate:
                    case DatabaseChangeTypeUpdate:
                        // only send message if file was created or contents
                        // changed - ignore other metadata changes
                        if (
                            c.type === DatabaseChangeTypeUpdate &&
                            c.obj.sha256 === c.oldObj.sha256
                        ) {
                            break;
                        }

                        yield* call(() =>
                            db.transaction('r', db._contents, async () => {
                                const file = await db._contents.get(c.obj.path);

                                // istanbul ignore if: programmer error if we hit this
                                if (!file) {
                                    console.error(
                                        `could not find file '${c.obj.path}'`,
                                    );
                                    return;
                                }

                                worker.postMessage(
                                    pythonMessageWriteUserFile(
                                        file.path,
                                        file.contents,
                                    ),
                                );
                            }),
                        );

                        break;

                    case DatabaseChangeTypeDelete:
                        worker.postMessage(pythonMessageDeleteUserFile(c.oldObj.path));
                        break;
                }
            }
        }
    } finally {
        dbChangedChan.close();
    }
}

/**
 * Runs a web worker with Pyodide so that we can use Jedi for intellisense.
 */
function* runJedi(): Generator {
    // TODO: web workers are not implemented in test environment
    if (process.env.NODE_ENV === 'test') {
        return;
    }

    const defer = new Array<() => void>();

    try {
        console.debug('creating code completion worker');

        // start the web worker and set up communication channels

        const worker = new Worker(
            new URL('../pybricksMicropython/python-worker.ts', import.meta.url),
        );

        defer.push(() => worker.terminate());

        const messageChannel = eventChannel<MessageEvent>((emit) => {
            worker.addEventListener('message', emit);

            return () => worker.removeEventListener('message', emit);
        }, buffers.expanding());

        defer.push(() => messageChannel.close());

        const errorChannel = eventChannel<ErrorEvent>((emit) => {
            worker.addEventListener('error', emit);

            return () => worker.removeEventListener('error', emit);
        }, buffers.expanding());

        defer.push(() => errorChannel.close());

        // wait for the Python runtime to start and get in a ready state

        worker.postMessage(pythonMessageInit());
        yield* put(editorCompletionInit());

        for (;;) {
            const { messageEvent, errorEvent } = yield* race({
                messageEvent: take(messageChannel),
                errorEvent: take(errorChannel),
            });

            if (errorEvent) {
                yield* put(editorCompletionDidFailToInit());
                throw errorEvent.error;
            }

            defined(messageEvent);

            if (pythonMessageDidMountUserFileSystem.matches(messageEvent.data)) {
                yield* fork(mirrorFileSystem, worker);
                continue;
            }

            if (pythonMessageDidFailToInit.matches(messageEvent.data)) {
                yield* put(editorCompletionDidFailToInit());
                throw messageEvent.data.error;
            }

            if (pythonMessageDidInit.matches(messageEvent.data)) {
                break;
            }
        }

        console.debug('code completion engine is ready');
        yield* put(editorCompletionDidInit());

        // configure interrupts
        // https://pyodide.org/en/stable/usage/keyboard-interrupts.html

        // HACK: Using WebAssembly.Memory instead of SharedArrayBuffer to avoid exception.
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer/Planned_changes#api_changes
        const interrupt = new Uint8Array(
            new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true }).buffer,
        );

        const setInterrupt = () => {
            interrupt[0] = 2; //2 === SIGINT
        };

        const clearInterrupt = () => {
            interrupt[0] = 0;
        };

        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements
        if (crossOriginIsolated) {
            worker.postMessage(pythonMessageSetInterruptBuffer(interrupt));
        } else {
            console.warn(
                'required headers missing for SharedArrayBuffer, cancellation will not work',
            );
        }

        // register intellisense hooks with editor

        const nextId = createCountFunc();

        const completionItemProviderChan = eventChannel<{
            model: monaco.editor.ITextModel;
            position: monaco.Position;
            context: monaco.languages.CompletionContext;
            token: monaco.CancellationToken;
            resolve: (value: monaco.languages.CompletionList | null) => void;
        }>((emit) => {
            const subscription = monaco.languages.registerCompletionItemProvider(
                pybricksMicroPythonId,
                {
                    triggerCharacters: ['.'],
                    provideCompletionItems(
                        model,
                        position,
                        context,
                        token,
                    ): Promise<monaco.languages.CompletionList | null> {
                        return new Promise((resolve) => {
                            emit({ model, position, context, token, resolve });
                        });
                    },
                },
            );

            return () => subscription.dispose();
        }, buffers.expanding());

        defer.push(() => completionItemProviderChan.close());

        const signatureProviderChan = eventChannel<{
            model: monaco.editor.ITextModel;
            position: monaco.Position;
            token: monaco.CancellationToken;
            context: monaco.languages.SignatureHelpContext;
            resolve: (value: monaco.languages.SignatureHelpResult | null) => void;
        }>((emit) => {
            const subscription = monaco.languages.registerSignatureHelpProvider(
                pybricksMicroPythonId,
                {
                    signatureHelpTriggerCharacters: ['(', ','],
                    signatureHelpRetriggerCharacters: [')'],
                    provideSignatureHelp(model, position, token, context) {
                        return new Promise((resolve) => {
                            emit({ model, position, token, context, resolve });
                        });
                    },
                },
            );

            return () => subscription.dispose();
        }, buffers.expanding());

        defer.push(() => signatureProviderChan.close());

        // Serialize requests from editor. Due to the way cancellation works, we
        // can only have one pending message from the web worker at a time.

        for (;;) {
            const { complete, getSignature } = yield* race({
                complete: take(completionItemProviderChan),
                getSignature: take(signatureProviderChan),
            });

            if (complete) {
                // for debugging
                const id = nextId();

                console.debug(`${id}: requested completion item`);

                const subscription = complete.token.onCancellationRequested(() => {
                    console.debug(`${id}: requested cancelation`);
                    setInterrupt();
                });

                try {
                    clearInterrupt();

                    worker.postMessage(
                        pythonMessageComplete(
                            complete.model.getValue(),
                            complete.position.lineNumber,
                            complete.position.column,
                        ),
                    );

                    for (;;) {
                        const msg = yield* take(messageChannel);

                        if (pythonMessageDidFailToComplete.matches(msg.data)) {
                            if (
                                msg.data.error instanceof DOMException &&
                                msg.data.error.name === 'AbortError'
                            ) {
                                console.log(`${id} canceled`);
                            } else {
                                console.error(msg.data.error);
                            }
                            complete.resolve(null);
                            break;
                        }

                        if (pythonMessageDidComplete.matches(msg.data)) {
                            const list: monaco.languages.CompletionItem[] = JSON.parse(
                                msg.data.completionListJson,
                            );

                            // maintain sort order from jedi
                            for (const [i, item] of list.entries()) {
                                item.sortText = String(i).padStart(5, '0');
                            }

                            console.debug(list);
                            complete.resolve({ suggestions: list });
                            console.debug(`${id}: resolved: ${msg.data.type}`);
                            break;
                        }
                    }
                } finally {
                    subscription.dispose();
                }
            } else if (getSignature) {
                // for debugging
                const id = nextId();

                console.debug(`${id}: requested signatures`);

                const subscription = getSignature.token.onCancellationRequested(() => {
                    console.debug(`${id}: requested cancelation`);
                    setInterrupt();
                });

                try {
                    clearInterrupt();

                    worker.postMessage(
                        pythonMessageGetSignature(
                            getSignature.model.getValue(),
                            getSignature.position.lineNumber,
                            getSignature.position.column,
                        ),
                    );

                    for (;;) {
                        const msg = yield* take(messageChannel);

                        if (pythonMessageDidFailToGetSignature.matches(msg.data)) {
                            if (
                                msg.data.error instanceof DOMException &&
                                msg.data.error.name === 'AbortError'
                            ) {
                                console.log(`${id} canceled`);
                            } else {
                                console.error(msg.data.error);
                            }
                            getSignature.resolve(null);
                            break;
                        }

                        if (pythonMessageDidGetSignature.matches(msg.data)) {
                            const signatures = JSON.parse(msg.data.signatureHelpJson);
                            console.debug(signatures);
                            getSignature.resolve({
                                value: signatures,
                                dispose: () => undefined,
                            });
                            console.debug(`${id}: resolved: ${msg.data.type}`);
                            break;
                        }
                    }
                } finally {
                    subscription.dispose();
                }
            }
        }
    } catch (err) {
        const isCancelled = yield* cancelled();

        if (!isCancelled) {
            console.error(err);
        }
    } finally {
        defer.forEach((item) => item());
    }
}

export default function* (): Generator {
    yield* fork(monitorEditors);
    yield* fork(runJedi);
}
