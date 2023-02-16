// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import {
    FirmwareMetadata,
    FirmwareMetadataV110,
    FirmwareMetadataV200,
    HubType,
} from '@pybricks/firmware';
import * as semver from 'semver';

const encoder = new TextEncoder();

/**
 * Validates the hub name.
 * @param hubName The hub name.
 * @param metadata The firmware metadata.
 * @returns True if the name if valid, otherwise false.
 */
export function validateHubName(hubName: string, metadata: FirmwareMetadata): boolean {
    const encoded = encoder.encode(hubName);

    if (semver.satisfies(metadata['metadata-version'], '^1.1')) {
        return encoded.length < (metadata as FirmwareMetadataV110)['max-hub-name-size'];
    }

    if (semver.satisfies(metadata['metadata-version'], '^2.0')) {
        return encoded.length < (metadata as FirmwareMetadataV200)['hub-name-size'];
    }

    return false;
}

const supportHubs: readonly HubType[] = [
    HubType.MoveHub,
    HubType.CityHub,
    HubType.TechnicHub,
    HubType.PrimeHub,
    HubType.EssentialHub,
];

export function validateMetadata(metadata: FirmwareMetadata) {
    if (semver.satisfies(metadata['metadata-version'], '^1')) {
        if (!supportHubs.includes(metadata['device-id'])) {
            throw new Error(`"unsupported "device-id": ${metadata['device-id']}`);
        }
    } else if (semver.satisfies(metadata['metadata-version'], '^2')) {
        if (!supportHubs.includes(metadata['device-id'])) {
            throw new Error(`"unsupported "device-id": ${metadata['device-id']}`);
        }
    } else {
        throw new Error(
            `unsupported "metadata-version": "${metadata['metadata-version']}"`,
        );
    }
}
