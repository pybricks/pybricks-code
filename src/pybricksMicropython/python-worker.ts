// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

// This file runs as a web worker.

// NB: We need to be very careful about imports here since many libraries for
// web aren't compatible with web workers!

import { PyodideInterface, loadPyodide, version as pyodideVersion } from 'pyodide';
import { ensureError } from '../utils';
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
} from './python-message';

type PythonError = InstanceType<PyodideInterface['PythonError']>;

function isPythonError(err: Error): err is PythonError {
    return err.constructor.name === 'PythonError';
}

/**
 * Wrapper around {@link ensureError} that also converts KeyboardInterrupt to
 * AbortError.
 * @param err The value from the catch clause.
 * @returns The fixed up error.
 */
function fixUpError(err: unknown): Error {
    const error = ensureError(err);

    if (isPythonError(error) && error.type === 'KeyboardInterrupt') {
        return new DOMException('cancelled via KeyboardInterrupt', 'AbortError');
    }

    return error;
}

/**
 * Naively converts a file system path to a python module name.
 *
 * Assumes `.py` file extension and no invalid characters.
 *
 * @param path The path.
 */
function pathToModule(path: string): string {
    return path.slice(0, path.length - 3).replaceAll('/', '.');
}

const setUpPythonEnvironment = `
import jedi
import pybricks_jedi

print('preloading pybricks_jedi...')
pybricks_jedi.initialize()
# TODO: this could be moved to pybricks_jedi.initialize()
pybricks_jedi.complete("from ", 1, 6)
print('preloading done.')
`;

async function init(): Promise<void> {
    console.log('starting Pyodide...');

    const pyodide = await loadPyodide({
        indexURL: `pyodide/${pyodideVersion}`,
        // REVISIT: would make more sense provide our own
        lockFileURL: new URL('pyodide/repodata.json', import.meta.url).toString(),
    });

    // REVISIT: it would be nice if we could make a custom driver to mount
    // the custom Pybricks Code Dexie-based file system directly instead of
    // mirroring it
    const mountDir = '/user';
    pyodide.FS.mkdir(mountDir);
    pyodide.FS.mount(pyodide.FS.filesystems.MEMFS, { root: '.' }, mountDir);

    const userModules = new Set<string>();

    self.addEventListener('message', async (e) => {
        if (pythonMessageWriteUserFile.matches(e.data)) {
            pyodide.FS.writeFile(`${mountDir}/${e.data.path}`, e.data.contents);
            console.debug('copied', e.data.path, 'to emscripten fs');
            userModules.add(pathToModule(e.data.path));
            return;
        }

        if (pythonMessageDeleteUserFile.matches(e.data)) {
            pyodide.FS.unlink(`${mountDir}/${e.data.path}`);
            console.debug('removed', e.data.path, ' from emscripten fs');
            userModules.delete(pathToModule(e.data.path));
            return;
        }
    });

    // separate message for file system ready since it takes a long time for
    // the rest of the init
    self.postMessage(pythonMessageDidMountUserFileSystem());

    // add user directory to sys.path for code completion
    await pyodide.runPythonAsync(`import sys; sys.path.append("${mountDir}")`);

    // NB: using URL+import.meta.url for webpack magic - don't try to optimize it
    await pyodide.loadPackage([
        new URL('@pybricks/jedi/docstring-parser.whl', import.meta.url).toString(),
        new URL('@pybricks/jedi/jedi.whl', import.meta.url).toString(),
        new URL('@pybricks/jedi/parso.whl', import.meta.url).toString(),
        new URL('@pybricks/jedi/pybricks-jedi.whl', import.meta.url).toString(),
        new URL('@pybricks/jedi/pybricks.whl', import.meta.url).toString(),
        new URL('@pybricks/jedi/typing_extensions.whl', import.meta.url).toString(),
    ]);

    await pyodide.runPythonAsync(setUpPythonEnvironment);

    const complete = pyodide.runPython('pybricks_jedi.complete');
    const getSignatures = pyodide.runPython('pybricks_jedi.get_signatures');
    const updateUserModules = pyodide.runPython('pybricks_jedi.update_user_modules');

    self.addEventListener('message', async (e) => {
        if (pythonMessageSetInterruptBuffer.matches(e.data)) {
            pyodide.setInterruptBuffer(e.data.buffer);
            return;
        }

        if (pythonMessageComplete.matches(e.data)) {
            console.debug('worker received complete message');
            try {
                updateUserModules(userModules);
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
                updateUserModules(userModules);
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
