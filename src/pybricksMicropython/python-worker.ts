// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

// This file runs as a web worker.

// NB: We need to be very careful about imports here since many libraries for
// web aren't compatible with web workers!

import type { loadPyodide as loadPyodideFunc } from 'pyodide';
import { ensureError } from '../utils';
import {
    pythonMessageComplete,
    pythonMessageDidComplete,
    pythonMessageDidFailToComplete,
    pythonMessageDidFailToGetSignature,
    pythonMessageDidFailToInit,
    pythonMessageDidGetSignature,
    pythonMessageDidInit,
    pythonMessageGetSignature,
    pythonMessageInit,
    pythonMessageSetInterruptBuffer,
} from './python-message';

importScripts('https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js');

declare const loadPyodide: typeof loadPyodideFunc;

/**
 * Wrapper around {@link ensureError} that also converts KeyboardInterrupt to
 * AbortError.
 * @param err The value from the catch clause.
 * @returns The fixed up error.
 */
function fixUpError(err: unknown): Error {
    const error = ensureError(err);

    if (
        error.constructor.name === 'PythonError' &&
        error.message.match(/KeyboardInterrupt/)
    ) {
        return new DOMException('cancelled', 'AbortError');
    }

    return error;
}

const setUpPythonEnvironment = `
import jedi
import micropip

print('loading pybricks...')
await micropip.install('pybricks-jedi')
print('loaded pybricks.')

import pybricks_jedi

print('preloading...')
pybricks_jedi.initialize()
print('preloading done.')
`;

async function init(): Promise<void> {
    console.log('starting Pyodide...');

    const pyodide = await loadPyodide();
    await pyodide.loadPackage(['micropip', 'jedi']);
    await pyodide.runPythonAsync(setUpPythonEnvironment);

    const complete = pyodide.runPython('pybricks_jedi.complete');
    const getSignatures = pyodide.runPython('pybricks_jedi.get_signatures');

    self.addEventListener('message', async (e) => {
        if (pythonMessageSetInterruptBuffer.matches(e.data)) {
            pyodide.setInterruptBuffer(e.data.buffer);
            return;
        }

        if (pythonMessageComplete.matches(e.data)) {
            console.debug('worker received complete message');
            try {
                const { code, lineNumber, column } = e.data;
                const list = complete(code, lineNumber, column);
                self.postMessage(pythonMessageDidComplete(list));
            } catch (err) {
                self.postMessage(pythonMessageDidFailToComplete(fixUpError(err)));
            }
            return;
        }

        if (pythonMessageGetSignature.matches(e.data)) {
            console.debug('worker received getSignatures message');
            try {
                const { code, lineNumber, column } = e.data;
                const list = getSignatures(code, lineNumber, column);
                self.postMessage(pythonMessageDidGetSignature(list));
            } catch (err) {
                self.postMessage(pythonMessageDidFailToGetSignature(fixUpError(err)));
            }
            return;
        }
    });

    console.log('Pyodide is ready.');
}

self.addEventListener('message', async (e) => {
    if (pythonMessageInit.matches(e.data)) {
        try {
            await init();
            postMessage(pythonMessageDidInit());
        } catch (err) {
            postMessage(pythonMessageDidFailToInit(ensureError(err)));
        }
    }
});
