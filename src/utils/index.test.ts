// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { acquireLock, assert, defined, ensureError, hex, maybe, timestamp } from '.';

test('assert', () => {
    const assertTrue = jest.fn(() => assert(true, 'should not throw'));
    assertTrue();
    expect(assertTrue).toHaveReturned();

    expect(() => assert(false, 'should throw')).toThrow();
});

describe('defined', () => {
    expect(() => defined('test')).not.toThrow();
    expect(() => defined(undefined)).toThrowError();
});

describe('maybe', () => {
    test('resolved', async () => {
        const [result, error] = await maybe(Promise.resolve('test'));
        expect(result).toBe('test');
        expect(error).toBeUndefined();
    });
    test('rejected', async () => {
        const [result, error] = await maybe(Promise.reject(new Error('test')));
        expect(result).toBeUndefined();
        expect(error).toBeInstanceOf(Error);
    });
});

test('hex', () => {
    expect(hex(0, 2)).toBe('0x00');
    expect(hex(1, 4)).toBe('0x0001');
    expect(hex(2, 8)).toBe('0x00000002');
});

test('ensureError', () => {
    const err = new Error('test error');
    expect(ensureError(err)).toBe(err);

    const stringToErrorMessage = 'not an Error';
    const stringToError = expect(ensureError(stringToErrorMessage));
    stringToError.toHaveProperty('name', 'Error');
    stringToError.toHaveProperty('message', stringToErrorMessage);
});

describe('timestamp', () => {
    it('should not contain spaces', () => {
        expect(timestamp()).not.toContain(' ');
    });

    it('should not contain colons', () => {
        expect(timestamp()).not.toContain(':');
    });

    it('should not contain periods', () => {
        expect(timestamp()).not.toContain('.');
    });

    it('should not contain letters', () => {
        expect(timestamp()).not.toMatch(/[A-Za-z]/);
    });
});

describe('acquireLock', () => {
    it.each([true, false])('should acquire lock when shared is %o', async () => {
        const releaseLock = await acquireLock('test');
        try {
            expect(releaseLock).toBeDefined();
        } finally {
            await releaseLock?.();
        }
    });

    it.each([true, false])(
        'should fail to acquire exclusive second lock when first lock shared is %o',
        async (shared) => {
            const releaseLock = await acquireLock('test', shared);
            try {
                const releaseLock2 = await acquireLock('test');
                try {
                    expect(releaseLock2).toBeUndefined();
                } finally {
                    await releaseLock2?.();
                }
            } finally {
                await releaseLock?.();
            }
        },
    );

    it('should acquire shared second lock when first lock is shared', async () => {
        const releaseLock = await acquireLock('test', true);
        try {
            const releaseLock2 = await acquireLock('test', true);
            try {
                expect(releaseLock2).toBeDefined();
            } finally {
                await releaseLock2?.();
            }
        } finally {
            await releaseLock?.();
        }
    });

    it('should fail to acquire shared second lock when first lock is exclusive', async () => {
        const releaseLock = await acquireLock('test');
        try {
            const releaseLock2 = await acquireLock('test', true);
            try {
                expect(releaseLock2).toBeUndefined();
            } finally {
                await releaseLock2?.();
            }
        } finally {
            await releaseLock?.();
        }
    });

    it('should acquire second lock when first lock is released', async () => {
        const releaseLock = await acquireLock('test');
        try {
            expect(releaseLock).toBeDefined();
        } finally {
            await releaseLock?.();
        }

        const releaseLock2 = await acquireLock('test');
        try {
            expect(releaseLock2).toBeDefined();
        } finally {
            await releaseLock2?.();
        }
    });

    it('should fail to acquire second lock when first lock is released but release is not awaited', async () => {
        const releaseLock = await acquireLock('test');
        try {
            expect(releaseLock).toBeDefined();
            // not awaited!
            releaseLock?.();

            const releaseLock2 = await acquireLock('test');
            try {
                expect(releaseLock2).toBeUndefined();
            } finally {
                await releaseLock2?.();
            }
        } finally {
            await releaseLock?.();
        }
    });
});
