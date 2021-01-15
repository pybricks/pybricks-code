// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { isMacOS, prefersDarkMode } from './os';

describe('isMacOS', () => {
    test('is true', () => {
        jest.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
        expect(isMacOS()).toBeTruthy();
    });
    test('is false', () => {
        jest.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32');
        expect(isMacOS()).toBeFalsy();
    });
});

describe('prefersDarkMode', () => {
    test('is true', () => {
        window.matchMedia = jest.fn().mockReturnValue({
            matches: true,
        } as MediaQueryList);
        expect(prefersDarkMode()).toBeTruthy();
    });
    test('is false', () => {
        // @ts-expect-error 2790
        delete window.matchMedia;
        expect(prefersDarkMode()).toBeFalsy();

        window.matchMedia = jest.fn().mockReturnValue({
            matches: false,
        } as MediaQueryList);
        expect(prefersDarkMode()).toBeFalsy();
    });
});
