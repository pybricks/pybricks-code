// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import localForage from 'localforage';
import { extendPrototype } from 'localforage-observable';
import { eventChannel } from 'redux-saga';
import { call, fork, put, takeEvery } from 'typed-redux-saga/macro';
import Observable from 'zen-observable';
import { ensureError } from '../utils';
import {
    fileStorageDidChangeItem,
    fileStorageDidFailToInitialize,
    fileStorageDidFailToReadFile,
    fileStorageDidFailToWriteFile,
    fileStorageDidInitialize,
    fileStorageDidReadFile,
    fileStorageDidRemoveItem,
    fileStorageDidWriteFile,
    fileStorageReadFile,
    fileStorageWriteFile,
} from './actions';

/**
 * Converts localForage change events to redux actions.
 * @param change The storage change event.
 */
function* handleFileStorageDidChange(change: LocalForageObservableChange): Generator {
    switch (change.methodName) {
        case 'setItem':
            if (change.success) {
                yield* put(fileStorageDidChangeItem(change.key));
            }
            break;
        case 'removeItem':
            if (change.success) {
                yield* put(fileStorageDidRemoveItem(change.key));
            }
            break;
    }
}

/**
 * Handles requests to read a file.
 * @param files The storage instance.
 * @param action The requested action.
 */
function* handleReadFile(
    files: LocalForage,
    action: ReturnType<typeof fileStorageReadFile>,
): Generator {
    try {
        const value = yield* call(() => files.getItem<string>(action.fileName));

        if (value === null) {
            throw new Error('file does not exist');
        }

        yield* put(fileStorageDidReadFile(action.fileName, value));
    } catch (err) {
        yield* put(fileStorageDidFailToReadFile(action.fileName, ensureError(err)));
    }
}

/**
 * Saves the file contents to storage.
 * @param files The localForage instance.
 * @param action The action that triggered this saga.
 */
function* handleWriteFile(
    files: LocalForage,
    action: ReturnType<typeof fileStorageWriteFile>,
) {
    try {
        yield* call(() => files.setItem(action.fileName, action.fileContents));
        yield* put(fileStorageDidWriteFile(action.fileName));
    } catch (err) {
        yield* put(fileStorageDidFailToWriteFile(action.fileName, ensureError(err)));
    }
}

/**
 * Initializes the storage backend.
 */
function* initialize(): Generator {
    try {
        // set up storage

        const files = extendPrototype(
            localForage.createInstance({ name: 'fileStorage' }),
        );

        files.newObservable.factory = (subscribe) =>
            // @ts-expect-error localforage-observable Subscription is missing
            // closed property compared to zen-observable Subscription.
            new Observable(subscribe);

        yield* call(() => files.ready());

        files.configObservables({
            crossTabNotification: true,
            crossTabChangeDetection: true,
        });

        // wire storage observable to redux-sagas

        const localForageChannel = eventChannel<LocalForageObservableChange>((emit) => {
            const filesObservable = files.newObservable({
                crossTabNotification: true,
            });

            const subscription = filesObservable.subscribe({
                next: (value) => emit(value),
            });

            return () => subscription.unsubscribe();
        });

        // subscribe to events

        yield* takeEvery(localForageChannel, handleFileStorageDidChange);
        yield* takeEvery(fileStorageReadFile, handleReadFile, files);
        yield* takeEvery(fileStorageWriteFile, handleWriteFile, files);

        // migrate from old storage

        // Previous versions of pybricks code used local storage to save a single program.
        const oldProgram = localStorage.getItem('program');

        if (oldProgram !== null) {
            yield* call(() => files.setItem('main.py', oldProgram));
            localStorage.removeItem('program');
        }

        yield* put(fileStorageDidInitialize());
    } catch (err) {
        yield* put(fileStorageDidFailToInitialize(ensureError(err)));
    }
}

export default function* (): Generator {
    yield* fork(initialize);
}
