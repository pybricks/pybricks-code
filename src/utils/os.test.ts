// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { isAndroid, isIOS, isLinux, isMacOS, isWindows } from './os';
import { defined } from '.';

class TestUserAgentData implements NavigatorUAData {
    getHighEntropyValues(_hints: string[]): Promise<UADataValues> {
        throw new Error('Method not implemented.');
    }
    toJSON(): UALowEntropyJSON {
        throw new Error('Method not implemented.');
    }
    get brands(): NavigatorUABrandVersion[] {
        throw new Error('Method not implemented.');
    }
    get mobile(): boolean {
        throw new Error('Method not implemented.');
    }
    get platform(): string {
        return 'test-agent';
    }
}

Object.defineProperty(navigator, 'userAgentData', { value: new TestUserAgentData() });

afterEach(() => {
    jest.resetAllMocks();
});

describe('isAndroid', () => {
    test('is true', () => {
        defined(navigator.userAgentData);
        jest.spyOn(navigator.userAgentData, 'platform', 'get').mockReturnValue(
            'Android',
        );
        expect(isAndroid()).toBeTruthy();
    });
    test('is false', () => {
        expect(isAndroid()).toBeFalsy();
    });
});

describe('isMacOS', () => {
    test('is true', () => {
        defined(navigator.userAgentData);
        jest.spyOn(navigator.userAgentData, 'platform', 'get').mockReturnValue('macOS');
        expect(isMacOS()).toBeTruthy();
    });
    test('is false', () => {
        expect(isMacOS()).toBeFalsy();
    });
});

describe('isWindows', () => {
    test('is true', () => {
        defined(navigator.userAgentData);
        jest.spyOn(navigator.userAgentData, 'platform', 'get').mockReturnValue(
            'Windows',
        );
        expect(isWindows()).toBeTruthy();
    });
    test('is false', () => {
        expect(isWindows()).toBeFalsy();
    });
});

describe('isLinux', () => {
    test('is true', () => {
        defined(navigator.userAgentData);
        jest.spyOn(navigator.userAgentData, 'platform', 'get').mockReturnValue('Linux');
        expect(isLinux()).toBeTruthy();
    });
    test('is false', () => {
        expect(isLinux()).toBeFalsy();
    });
});

describe('isIOS', () => {
    test('is true', () => {
        defined(navigator.userAgentData);
        jest.spyOn(navigator.userAgentData, 'platform', 'get').mockReturnValue('iOS');
        expect(isIOS()).toBeTruthy();
    });
    test('is false', () => {
        expect(isIOS()).toBeFalsy();
    });
});
