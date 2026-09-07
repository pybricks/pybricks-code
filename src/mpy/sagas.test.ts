// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import 'core-js/stable/structured-clone';
import 'fake-indexeddb/auto';
import 'dexie-observable';
import { AsyncSaga, uuid } from '../../test';
import { editorGetValueRequest, editorGetValueResponse } from '../editor/actions';
import { FileStorageDb } from '../fileStorage';
import { createCountFunc } from '../utils/iter';
import {
    compile,
    didCompile,
    didFailToCompile,
    mpyCompileMulti6,
    mpyDidCompileMulti6,
    mpyDidFailToCompileMulti6,
} from './actions';
import mpy from './sagas';
import { mockMpyCrossWasmPath } from './test-utils';

beforeEach(() => {
    mockMpyCrossWasmPath();
});

afterEach(() => {
    jest.clearAllMocks();
});

test('compiler works', async () => {
    const saga = new AsyncSaga(mpy);

    saga.put(compile('print("hello!")', 6, []));

    const action = await saga.take();
    expect(didCompile.matches(action)).toBeTruthy();
    const { data } = action as ReturnType<typeof didCompile>;
    expect(data[0]).toBe('M'.charCodeAt(0));
    expect(data[1]).toBe(6); // ABI version
    expect(data[2]).toBe(0); // flags
    expect(data[3]).toBe(31); // small int bits
});

test('compiler error works', async () => {
    const saga = new AsyncSaga(mpy);

    saga.put(compile('syntax error!', 6, []));

    const action = await saga.take();
    expect(didFailToCompile.matches(action)).toBeTruthy();
    const { err } = action as ReturnType<typeof didFailToCompile>;
    expect(err).toMatchInlineSnapshot(`
        [
          "Traceback (most recent call last):",
          "  File "main.py", line 1",
          "SyntaxError: invalid syntax",
        ]
    `);

    await saga.end();
});

describe('handleCompileMulti6', () => {
    let db: FileStorageDb;
    let saga: AsyncSaga;
    let nextUuid: () => number;

    beforeEach(async () => {
        db = new FileStorageDb('test');
        // the main module is uuid(0), which is what the editor state points at
        nextUuid = createCountFunc();

        saga = new AsyncSaga(mpy, {
            fileStorage: db,
            nextMessageId: createCountFunc(),
        });

        saga.updateState({
            editor: { isReady: true, activeFileUuid: uuid(0) },
        });
    });

    afterEach(async () => {
        await saga.end();
        db.close();

        await new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase('test');
            request.addEventListener('success', resolve);
            request.addEventListener('error', reject);
            request.addEventListener('blocked', reject);
        });
    });

    /** jsdom's Blob doesn't implement arrayBuffer(), so use FileReader instead. */
    function readBlob(blob: Blob): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(blob);
        });
    }

    /** Adds a module to the simulated user file system. */
    async function addFile(name: string, contents: string): Promise<void> {
        await db.metadata.add({
            uuid: uuid(nextUuid()),
            path: `${name}.py`,
            sha256: '',
            viewState: null,
        });
        await db._contents.add({ path: `${name}.py`, contents });
    }

    /**
     * Runs the multi-mpy6 compile and returns the module names in the resulting
     * program, in order.
     */
    async function compileMulti6(mainPy: string): Promise<string[]> {
        saga.put(mpyCompileMulti6());

        // handleCompileMulti6() reads the main file from the editor, not the database
        const request = await saga.take();
        expect(editorGetValueRequest.matches(request)).toBeTruthy();
        saga.put(
            editorGetValueResponse(
                (request as ReturnType<typeof editorGetValueRequest>).id,
                mainPy,
            ),
        );

        const action = await saga.take();

        if (mpyDidFailToCompileMulti6.matches(action)) {
            throw new Error(action.error.join('\n'));
        }

        expect(mpyDidCompileMulti6.matches(action)).toBeTruthy();

        // each module is encoded as a uint32 size, a zero-terminated name, then the
        // .mpy binary
        const blob = (action as ReturnType<typeof mpyDidCompileMulti6>).file;
        const data = new DataView(await readBlob(blob));
        const names: string[] = [];

        for (let offset = 0; offset < data.byteLength; ) {
            const size = data.getUint32(offset, true);
            offset += 4;

            let end = offset;
            while (data.getUint8(end) !== 0) {
                end++;
            }

            names.push(
                new TextDecoder().decode(
                    new Uint8Array(data.buffer, offset, end - offset),
                ),
            );

            offset = end + 1 + size;
        }

        return names;
    }

    test('a program with no imports contains only the main module', async () => {
        await addFile('main', '');

        await expect(compileMulti6('print("hello!")')).resolves.toEqual(['main']);
    });

    test('imported modules are included', async () => {
        await addFile('main', '');
        await addFile('my_lib', 'VALUE = 1\n');

        await expect(
            compileMulti6('import my_lib\nprint(my_lib.VALUE)'),
        ).resolves.toEqual(['main', 'my_lib']);
    });

    test('imports are resolved transitively', async () => {
        await addFile('main', '');
        await addFile('first', 'import second\n');
        await addFile('second', 'import third\n');
        await addFile('third', 'VALUE = 3\n');

        await expect(compileMulti6('import first')).resolves.toEqual([
            'main',
            'first',
            'second',
            'third',
        ]);
    });

    test('modules that are not in the file system are assumed to be built in', async () => {
        await addFile('main', '');

        await expect(
            compileMulti6('from pybricks.hubs import PrimeHub'),
        ).resolves.toEqual(['main']);
    });

    test('circular imports terminate', async () => {
        await addFile('main', '');
        await addFile('a', 'import b\n');
        await addFile('b', 'import a\n');

        await expect(compileMulti6('import a')).resolves.toEqual(['main', 'a', 'b']);
    });

    test('a syntax error in an imported module fails the compile', async () => {
        await addFile('main', '');
        await addFile('broken', 'syntax error!\n');

        await expect(compileMulti6('import broken')).rejects.toThrow(/SyntaxError/);
    });
});
