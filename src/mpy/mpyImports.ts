// SPDX-License-Identifier: MIT
// Copyright (c) 2026 The Pybricks Authors

import { staticQstrs } from './staticQstrs';

/**
 * Reads the names of the modules imported by a program from its compiled .mpy file.
 *
 * Doing this instead of parsing the Python source in JavaScript means we get exactly
 * the same answer MicroPython itself would get, since it is MicroPython's own compiler
 * that produced the bytecode we are reading.
 *
 * The format is documented by `py/persistentcode.c` and `tools/mpy-tool.py` in
 * MicroPython. Everything here matches MicroPython v1.19.1 (which
 * `@pybricks/mpy-cross-v6` is built from) through pybricks-micropython master, and the
 * `MPY_SUB_VERSION` mechanism exists so that bytecode-only .mpy files stay compatible
 * across all of ABI v6.
 */

/** The .mpy ABI version this code knows how to read. */
const mpyAbiVersion = 6;

// Opcodes from py/bc0.h that we need to recognize.
const mpBcLoadConstSmallInt = 0x22;
const mpBcImportName = 0x1b;
const mpBcLoadConstSmallIntMulti = 0x70;
const mpBcLoadConstSmallIntMultiNum = 64;
const mpBcLoadConstSmallIntMultiExcess = 16;

/** Opcodes with `opcode & this === 0` are followed by one extra byte. */
const mpBcMaskExtraByte = 0x9e;

// Operand encodings from py/bc0.h. The packed table maps the high nibble of an opcode
// to one of these; see MP_BC_FORMAT() and mp_opcode_decode().
const mpBcFormatTable = 0x3a4;
const mpBcFormatQstr = 1;
const mpBcFormatVarUint = 2;
const mpBcFormatOffset = 3;

/** Object types from the MP_PERSISTENT_OBJ_* enum in py/persistentcode.h. */
enum PersistentObj {
    FunTable = 0,
    None = 1,
    False = 2,
    True = 3,
    Ellipsis = 4,
    Str = 5,
    Bytes = 6,
    Int = 7,
    Float = 8,
    Complex = 9,
    Tuple = 10,
}

/** Error raised when a .mpy file cannot be read. */
export class MpyFormatError extends Error {}

/**
 * Finds the modules imported by a compiled program.
 *
 * Relative imports are returned with their leading dots, e.g. `..module`.
 *
 * @param mpy A compiled .mpy file (ABI version 6, bytecode only).
 * @returns The names of the imported modules.
 * @throws {MpyFormatError} If the file is not a .mpy file this code can read.
 */
export function findImportedModules(mpy: Uint8Array): ReadonlySet<string> {
    const modules = new Set<string>();
    let pos = 0;

    function readByte(): number {
        if (pos >= mpy.length) {
            throw new MpyFormatError('unexpected end of .mpy file');
        }

        return mpy[pos++];
    }

    /** Reads a MicroPython variable length unsigned integer. */
    function readUint(): number {
        let value = 0;

        for (;;) {
            const b = readByte();
            value = (value << 7) | (b & 0x7f);

            if (!(b & 0x80)) {
                return value;
            }
        }
    }

    function take(size: number): Uint8Array {
        if (size < 0 || pos + size > mpy.length) {
            throw new MpyFormatError('unexpected end of .mpy file');
        }

        const bytes = mpy.subarray(pos, pos + size);
        pos += size;

        return bytes;
    }

    // Header is 'M', ABI version, feature flags, small int bits.
    if (mpy.length < 4 || mpy[0] !== 'M'.charCodeAt(0)) {
        throw new MpyFormatError('not a .mpy file');
    }

    if (mpy[1] !== mpyAbiVersion) {
        throw new MpyFormatError(`unsupported .mpy ABI version: ${mpy[1]}`);
    }

    // The top bits of the feature flags are MPY_FEATURE_ENCODE_ARCH(). We only know how
    // to walk bytecode, so anything other than MP_NATIVE_ARCH_NONE is not supported.
    if (mpy[2] >> 2 !== 0) {
        throw new MpyFormatError('.mpy file contains native code');
    }

    pos = 4;

    const nQstr = readUint();
    const nObj = readUint();

    // The qstr table holds all of the names used by the module. Qstr operands in the
    // bytecode are indices into this table.
    const decoder = new TextDecoder();
    const qstrTable = new Array<string>(nQstr);

    for (let i = 0; i < nQstr; i++) {
        const encodedLength = readUint();

        if (encodedLength & 1) {
            // reference to one of MicroPython's static qstrs
            const index = encodedLength >> 1;
            const qstr = index < staticQstrs.length ? staticQstrs[index] : undefined;

            if (qstr === undefined || qstr === null) {
                throw new MpyFormatError(`bad static qstr index: ${index}`);
            }

            qstrTable[i] = qstr;
        } else {
            const bytes = take(encodedLength >> 1);
            take(1); // null terminator
            qstrTable[i] = decoder.decode(bytes);
        }
    }

    // The object table holds constants. We don't need any of them, but they have to be
    // stepped over to find the bytecode that follows.
    function skipObj(): void {
        const type = readByte() as PersistentObj;

        switch (type) {
            case PersistentObj.FunTable:
            case PersistentObj.None:
            case PersistentObj.False:
            case PersistentObj.True:
            case PersistentObj.Ellipsis:
                break;
            case PersistentObj.Tuple: {
                const n = readUint();

                for (let i = 0; i < n; i++) {
                    skipObj();
                }

                break;
            }
            case PersistentObj.Str:
            case PersistentObj.Bytes:
                take(readUint());
                take(1); // null terminator
                break;
            case PersistentObj.Int:
            case PersistentObj.Float:
            case PersistentObj.Complex:
                take(readUint());
                break;
            default:
                throw new MpyFormatError(`bad .mpy object type: ${type}`);
        }
    }

    for (let i = 0; i < nObj; i++) {
        skipObj();
    }

    /**
     * Scans one function's bytecode for import statements.
     *
     * @param bytecode The function data, starting with the prelude.
     */
    function scanBytecode(bytecode: Uint8Array): void {
        let ip = 0;

        function preludeByte(): number {
            if (ip >= bytecode.length) {
                throw new MpyFormatError('unexpected end of .mpy bytecode');
            }

            return bytecode[ip++];
        }

        // Skip the prelude signature (see MP_BC_PRELUDE_SIG_DECODE in py/bc.h).
        while (preludeByte() & 0x80) {
            // all we need is the length
        }

        // Read the prelude size to find where the opcodes start (see
        // MP_BC_PRELUDE_SIZE_DECODE in py/bc.h). nInfo covers the source info and
        // argument names, nCell covers the closure info.
        let nInfo = 0;
        let nCell = 0;

        for (let n = 0; ; n++) {
            const z = preludeByte();
            nInfo |= ((z & 0x7e) >> 1) << (6 * n);
            nCell |= (z & 1) << n;

            if (!(z & 0x80)) {
                break;
            }
        }

        ip += nInfo + nCell;

        // The compiler always pushes the relative import level as a small int
        // immediately before MP_BC_IMPORT_NAME, so the most recently loaded small int
        // is the number of leading dots. See compile_dotted_as_name() and
        // compile_import_from() in py/compile.c.
        let importLevel = 0;

        while (ip < bytecode.length) {
            const opcode = bytecode[ip];
            const format = (mpBcFormatTable >> (2 * (opcode >> 4))) & 3;
            let next = ip + 1;
            let arg = 0;

            if (format === mpBcFormatQstr || format === mpBcFormatVarUint) {
                arg = bytecode[next] & 0x7f;

                if (opcode === mpBcLoadConstSmallInt && arg & 0x40) {
                    // sign extend
                    arg -= 0x80;
                }

                while (bytecode[next] & 0x80) {
                    next++;
                    arg = (arg << 7) | (bytecode[next] & 0x7f);
                }

                next++;
            } else if (format === mpBcFormatOffset) {
                // we only need the size, not the offset itself
                next += bytecode[next] & 0x80 ? 2 : 1;
            }

            if ((opcode & mpBcMaskExtraByte) === 0) {
                next++;
            }

            if (opcode === mpBcLoadConstSmallInt) {
                importLevel = arg;
            } else if (
                opcode >= mpBcLoadConstSmallIntMulti &&
                opcode < mpBcLoadConstSmallIntMulti + mpBcLoadConstSmallIntMultiNum
            ) {
                importLevel =
                    opcode -
                    mpBcLoadConstSmallIntMulti -
                    mpBcLoadConstSmallIntMultiExcess;
            } else if (opcode === mpBcImportName) {
                const name = arg < qstrTable.length ? qstrTable[arg] : undefined;

                if (name === undefined) {
                    throw new MpyFormatError(`bad qstr index: ${arg}`);
                }

                modules.add('.'.repeat(Math.max(importLevel, 0)) + name);
            }

            if (next <= ip) {
                // this would mean we misread an opcode size and would loop forever
                throw new MpyFormatError(`bad .mpy opcode: ${opcode}`);
            }

            ip = next;
        }
    }

    /**
     * Walks one entry of the raw code tree, recursing into nested functions and classes
     * so that imports in any scope are found.
     */
    function walkRawCode(): void {
        const kindLen = readUint();
        const kind = kindLen & 3;
        const hasChildren = !!(kindLen & 4);
        const funDataLen = kindLen >> 3;

        // 0 is MP_CODE_BYTECODE. Native code is rejected by the header check above, so
        // this should be unreachable.
        if (kind !== 0) {
            throw new MpyFormatError('.mpy file contains native code');
        }

        scanBytecode(take(funDataLen));

        if (hasChildren) {
            const nChildren = readUint();

            for (let i = 0; i < nChildren; i++) {
                walkRawCode();
            }
        }
    }

    walkRawCode();

    return modules;
}
