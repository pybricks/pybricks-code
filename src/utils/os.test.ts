// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { isMacOS, isWindows, prefersDarkMode } from './os';

afterEach(() => {
    jest.resetAllMocks();
});

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

describe('isWindows', () => {
    test('is true', () => {
        jest.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32');
        expect(isWindows()).toBeTruthy();
    });
    test('is false', () => {
        jest.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
        expect(isWindows()).toBeFalsy();
    });
});

describe('prefersDarkMode', () => {
    test('is true', () => {
        jest.spyOn(window, 'matchMedia').mockReturnValue({
            matches: true,
        } as MediaQueryList);
        expect(prefersDarkMode()).toBeTruthy();
    });
    test('is false', () => {
        jest.spyOn(window, 'matchMedia').mockReturnValue({
            matches: false,
        } as MediaQueryList);
        expect(prefersDarkMode()).toBeFalsy();
    });
});
