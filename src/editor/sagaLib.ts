// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { SagaGenerator, getContext, put, select, take } from 'typed-redux-saga/macro';
import { RootState } from '../reducers';
import { editorGetValueRequest, editorGetValueResponse } from './actions';

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
