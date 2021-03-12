import { Status, statusToFlag } from './protocol';

describe('status flags should fit in 32 bits', () => {
    test.each(Object.values(Status).filter((x) => typeof x === 'number'))(
        '%s',
        (status) => {
            expect(Math.log2(statusToFlag(status as Status))).toBe(status);
        },
    );
});
