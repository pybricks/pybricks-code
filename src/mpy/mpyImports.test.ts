// SPDX-License-Identifier: MIT
// Copyright (c) 2026 The Pybricks Authors

import { compile as mpyCrossCompileV6 } from '@pybricks/mpy-cross-v6';
import { MpyFormatError, findImportedModules } from './mpyImports';
import { mockMpyCrossWasmPath, mpyCrossV6WasmPath } from './test-utils';

beforeEach(() => {
    mockMpyCrossWasmPath();
});

afterEach(() => {
    jest.clearAllMocks();
});

async function compileToMpy(script: string): Promise<Uint8Array> {
    const result = await mpyCrossCompileV6(
        'test.py',
        script,
        undefined,
        mpyCrossV6WasmPath,
    );

    expect(result.err).toEqual([]);
    expect(result.status).toBe(0);
    expect(result.mpy).toBeDefined();

    return result.mpy as Uint8Array;
}

async function findImportsInScript(script: string): Promise<ReadonlySet<string>> {
    return findImportedModules(await compileToMpy(script));
}

test('findImportedModules', async () => {
    const script = `
import a
import b, c
import d.d
import e.e as e
import f.f as f, g
from h import x
from h import x as y
from i import (x, y)
from i import (x as y, z)
from j import *
from . import x
from . import x as y
from .r import x
from ..r import x
from ...r import x
from ....r import x

# import q
# from q import q
"""
import q
from q import q
"""
'''
import q
from q import q
'''
`;

    const modules = await findImportsInScript(script);

    expect(modules).toEqual(
        new Set([
            'a',
            'b',
            'c',
            'd.d',
            'e.e',
            'f.f',
            'g',
            'h',
            'i',
            'j',
            '.',
            '.r',
            '..r',
            '...r',
            '....r',
        ]),
    );
});

test('https://github.com/pybricks/support/issues/873 regression', async () => {
    const script = `
from my_module import data

async def hello():
    print("hello")

print(data)
`;

    const modules = await findImportsInScript(script);

    expect(modules).toEqual(new Set(['my_module']));
});

test('https://github.com/pybricks/support/issues/1954 regression', async () => {
    // an f-string containing the same kind of quote that delimits it (PEP 701)
    const script = `
import mission_run_1
missions = [("1", "irrelevant_name", "first"), ("2", "stop", "stop"),]
print(f"hasattr f-string {hasattr(missions[0][1], "run")}")
`;

    const modules = await findImportsInScript(script);

    expect(modules).toEqual(new Set(['mission_run_1']));
});

test('https://github.com/pybricks/support/issues/1981 regression', async () => {
    // MicroPython accepts a decimal literal with a leading zero
    const script = `
import my_lib
print(050)
`;

    const modules = await findImportsInScript(script);

    expect(modules).toEqual(new Set(['my_lib']));
});

test(
    'https://github.com/pybricks/support/issues/1804 regression',
    async () => {
        // A large program used to make the old Python parser allocate memory
        // proportional to (lines * file size), which crashed the browser tab.
        const line =
            'data = b"132456789132456789132456789132456789132456789132456789132456789"';
        const script = ['import my_lib', ...new Array(7000).fill(line), ''].join('\n');

        expect(script.length).toBeGreaterThan(400000);

        const modules = await findImportsInScript(script);

        expect(modules).toEqual(new Set(['my_lib']));
    },
    30 * 1000,
);

test('imports are found in every scope', async () => {
    const script = `
import at_module_level

def func():
    import in_func

class Cls:
    import in_class

    def method(self):
        import in_method

async def async_func():
    import in_async_func

def outer():
    def inner():
        import deeply_nested

if unknown:
    import in_if
else:
    import in_else

while unknown:
    import in_while

for i in range(3):
    import in_for

with open("f") as f:
    import in_with

try:
    import in_try
except ImportError:
    import in_except
finally:
    import in_finally

lam = lambda: [__import__("in_comprehension") for i in range(1)]
`;

    const modules = await findImportsInScript(script);

    expect(modules).toEqual(
        new Set([
            'at_module_level',
            'in_func',
            'in_class',
            'in_method',
            'in_async_func',
            'deeply_nested',
            'in_if',
            'in_else',
            'in_while',
            'in_for',
            'in_with',
            'in_try',
            'in_except',
            'in_finally',
        ]),
    );
});

test('module names that are static qstrs are found', async () => {
    // Names at or below QSTR_LAST_STATIC are stored as an index instead of a string.
    // 'main' is one of them and main.py is a very common user program name.
    const modules = await findImportsInScript(
        'import main\nimport time\nimport sys\nfrom math import pi\n',
    );

    expect(modules).toEqual(new Set(['main', 'time', 'sys', 'math']));
});

test('a program with no imports gives an empty set', async () => {
    const modules = await findImportsInScript('print("hello!")\n');

    expect(modules).toEqual(new Set());
});

describe('bad .mpy files are rejected', () => {
    // These guard against a future mpy-cross update changing the file format. If any of
    // them start failing, findImportedModules() needs to be updated to match.

    test('the expected header is produced', async () => {
        const mpy = await compileToMpy('print("hello!")\n');

        expect(mpy[0]).toBe('M'.charCodeAt(0));
        expect(mpy[1]).toBe(6); // ABI version
        expect(mpy[2]).toBe(0); // feature flags (no native code)
        expect(mpy[3]).toBe(31); // small int bits
    });

    test('not a .mpy file', () => {
        expect(() => findImportedModules(new Uint8Array([1, 2, 3, 4]))).toThrow(
            MpyFormatError,
        );
    });

    test('empty file', () => {
        expect(() => findImportedModules(new Uint8Array())).toThrow(MpyFormatError);
    });

    test('unsupported abi version', async () => {
        const mpy = await compileToMpy('print("hello!")\n');
        mpy[1] = 7;

        expect(() => findImportedModules(mpy)).toThrow(
            'unsupported .mpy ABI version: 7',
        );
    });

    test('contains native code', async () => {
        const mpy = await compileToMpy('print("hello!")\n');
        mpy[2] = 1 << 2;

        expect(() => findImportedModules(mpy)).toThrow(
            '.mpy file contains native code',
        );
    });

    test('truncated file', async () => {
        const mpy = await compileToMpy('import my_lib\nprint("hello!")\n');

        expect(() => findImportedModules(mpy.subarray(0, mpy.length - 5))).toThrow(
            MpyFormatError,
        );
    });
});
