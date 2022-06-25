// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../actions';

// NB: although we are using the same action creator as we do for redux, these
// actions are not used by redux but rather are to sent between workers.

/**
 * Message sent from main to work to request initialization of Pyodide.
 */
export const pythonMessageInit = createAction(() => ({
    type: 'python.message.init',
}));

/**
 * Message sent from worker to main that indicates {@link pythonMessageInit}
 * succeeded.
 */
export const pythonMessageDidInit = createAction(() => ({
    type: 'python.message.didInit',
}));

/**
 * Message sent from worker to main that indicates {@link pythonMessageInit}
 * failed.
 */
export const pythonMessageDidFailToInit = createAction((error: Error) => ({
    type: 'python.message.didFailToInit',
    error,
}));

/**
 * Message sent from main to worker to set the shared interrupt buffer.
 */
export const pythonMessageSetInterruptBuffer = createAction((buffer: Uint8Array) => ({
    type: 'python.message.setInterruptBuffer',
    buffer,
}));

/**
 * Message sent from main to worker to request code completion.
 */
export const pythonMessageComplete = createAction(
    (code: string, lineNumber: number, column: number) => ({
        type: 'python.message.complete',
        code,
        lineNumber,
        column,
    }),
);

/**
 * Message sent from worker to main that indicates {@link pythonMessageComplete}
 * succeeded.
 */
export const pythonMessageDidComplete = createAction((completionListJson: string) => ({
    type: 'python.message.didComplete',
    completionListJson,
}));

/**
 * Message sent from worker to main that indicates {@link pythonMessageComplete}
 * failed.
 */
export const pythonMessageDidFailToComplete = createAction((error: Error) => ({
    type: 'python.message.didFailToComplete',
    error,
}));

/**
 * Message sent from main to worker to request function signature.
 */
export const pythonMessageGetSignature = createAction(
    (code: string, lineNumber: number, column: number) => ({
        type: 'python.message.getSignature',
        code,
        lineNumber,
        column,
    }),
);

/**
 * Message sent from worker to main that indicates {@link pythonMessageGetSignature}
 * succeeded.
 */
export const pythonMessageDidGetSignature = createAction(
    (signatureHelpJson: string) => ({
        type: 'python.message.didGetSignature',
        signatureHelpJson,
    }),
);

/**
 * Message sent from worker to main that indicates {@link pythonMessageGetSignature}
 * failed.
 */
export const pythonMessageDidFailToGetSignature = createAction((error: Error) => ({
    type: 'python.message.didFailToGetSignature',
    error,
}));
