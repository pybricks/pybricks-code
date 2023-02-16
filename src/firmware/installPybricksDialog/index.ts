// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { FirmwareMetadata, HubType } from '@pybricks/firmware';
import * as semver from 'semver';

const encoder = new TextEncoder();

/**
 * Validates the hub name.
 * @param hubName The hub name.
 * @returns True if the name if valid, otherwise false.
 */
export function validateHubName(hubName: string): boolean {
    const encoded = encoder.encode(hubName);

    // Technically, the max hub name size is determined by each individual
    // firmware file, so we can't check until the firmware has been selected.
    // However all firmware currently have 16 bytes allocated (including zero-
    // termination), so we can hard code the check here to allow notifying the
    // user earlier for better UX.
    return encoded.length < 16;
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
