import { fmod, sumComplement32 } from './math';

describe('fmod', () => {
    test('positive numbers', () => {
        expect(fmod(3, 4)).toBe(3 % 4);
    });

    test('negative and positive number', () => {
        expect(fmod(-3, 4)).toBe(1);
    });
});

describe('sumComplement32', () => {
    test('basic', () => {
        expect(sumComplement32([1, 2, 3, 4, 5])).toBe(-(1 + 2 + 3 + 4 + 5));
    });
    test('overflow', () => {
        expect(sumComplement32([0xffffffff, 0xffffffff])).toBe(-(-1 + -1));
    });
});
