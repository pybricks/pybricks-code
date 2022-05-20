// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { CustomError } from './customError';

// all subclasses should be declared like this:

type TestErrorName = 'Test';

class TestError extends CustomError<TestErrorName> {}

describe('CustomError', () => {
    it('should work with instanceof', () => {
        expect(new TestError('Test', 'test')).toBeInstanceOf(TestError);
    });

    it('should override name', () => {
        expect(new TestError('Test', 'test')).toHaveProperty('name', 'Test');
    });

    it('should pass cause', () => {
        const testCause = new Error('test cause');
        expect(() => {
            throw new TestError('Test', 'test', testCause);
        }).toThrow({ name: 'Test', message: 'test', cause: testCause });
    });

    it('should serialize to something useful', () => {
        expect(JSON.stringify(new TestError('Test', 'test'))).toBe(
            '"[TestError: Test]"',
        );

        expect(`${new TestError('Test', 'test')}`).toBe('[TestError: Test]');
    });
});
