import { fmod } from './math';

test('fmod of positive numbers', () => {
    expect(fmod(3, 4)).toBe(3 % 4);
});

test('fmod of negative and positive number', () => {
    expect(fmod(-3, 4)).toBe(1);
});
