import { fmod, sumComplement32 } from './math';

test('fmod of positive numbers', () => {
    expect(fmod(3, 4)).toBe(3 % 4);
});

test('fmod of negative and positive number', () => {
    expect(fmod(-3, 4)).toBe(1);
});

test('sumComplement32', () => {
    // basic test
    expect(sumComplement32([1, 2, 3, 4, 5])).toBe(-(1 + 2 + 3 + 4 + 5));
    // overflow
    expect(sumComplement32([0xffffffff, 0xffffffff])).toBe(-(-1 + -1));
});
