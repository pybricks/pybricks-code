// SPDX-License-Identifier: MIT
// Copyright (c) 2023 The Pybricks Authors

import { validateHubName, validateMetadata } from '.';

describe('validateHubName', () => {
    it('should accept short name', () => {
        expect(
            validateHubName('good', {
                'metadata-version': '1.1.0',
                'device-id': 0x40,
                'firmware-version': '3.0.0',
                'checksum-type': 'sum',
                'max-firmware-size': 100000,
                'mpy-abi-version': 6,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 90000,
                'hub-name-offset': 80000,
                'max-hub-name-size': 16,
            }),
        ).toBeTruthy();
    });

    it('should accept empty name', () => {
        expect(
            validateHubName('', {
                'metadata-version': '2.0.0',
                'device-id': 0x40,
                'firmware-version': '3.0.0',
                'checksum-type': 'sum',
                'checksum-size': 100000,
                'hub-name-offset': 100000 - 16,
                'hub-name-size': 16,
            }),
        ).toBeTruthy();
    });

    it('should reject long name', () => {
        expect(
            validateHubName('this name is too long', {
                'metadata-version': '1.1.0',
                'device-id': 0x40,
                'firmware-version': '3.0.0',
                'checksum-type': 'sum',
                'max-firmware-size': 100000,
                'mpy-abi-version': 6,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 90000,
                'hub-name-offset': 80000,
                'max-hub-name-size': 16,
            }),
        ).toBeFalsy();
    });
});

describe('validateMetadata', () => {
    it('should accept 1.x firmware metadata', () => {
        expect(() =>
            validateMetadata({
                'metadata-version': '1.0.0',
                'device-id': 0x40,
                'firmware-version': '3.0.0',
                'checksum-type': 'sum',
                'max-firmware-size': 100000,
                'mpy-abi-version': 6,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 90000,
            }),
        ).not.toThrow();
    });

    it('should accept 2.x firmware metadata', () => {
        expect(() =>
            validateMetadata({
                'metadata-version': '2.0.0',
                'device-id': 0x40,
                'firmware-version': '3.0.0',
                'checksum-type': 'sum',
                'checksum-size': 100000,
                'hub-name-offset': 100000 - 16,
                'hub-name-size': 16,
            }),
        ).not.toThrow();
    });

    it('should reject 3.x firmware metadata', () => {
        expect(() =>
            validateMetadata({
                // @ts-expect-error: testing bad data
                'metadata-version': '3.0.0',
                'device-id': 0x40,
                'firmware-version': '3.0.0',
                'checksum-type': 'sum',
                'checksum-size': 100000,
                'hub-name-offset': 100000 - 16,
                'hub-name-size': 16,
            }),
        ).toThrow(/"metadata-version"/);
    });

    it('should reject unsupported device id', () => {
        expect(() =>
            validateMetadata({
                'metadata-version': '2.0.0',
                'device-id': 0xe0,
                'firmware-version': '3.0.0',
                'checksum-type': 'sum',
                'checksum-size': 100000,
                'hub-name-offset': 100000 - 16,
                'hub-name-size': 16,
            }),
        ).toThrow(/"device-id"/);
    });
});
