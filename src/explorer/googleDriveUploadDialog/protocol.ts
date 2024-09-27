// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

/** A individual doc returned from Google Picker API. */
export interface DriveDocument {
    description: string;
    downloadUrl?: string;
    driveSuccess: boolean;
    embedUrl: string;
    iconUrl: string;
    id: string;
    isShared: boolean;
    lastEditedUtc: number;
    mimeType: string;
    name: string;
    rotation: number;
    rotationDegree: number;
    serviceId: string;
    sizeBytes: number;
    type: string;
    uploadState?: string;
    url: string;
}

/** Response from Google Picker API. */
export interface PickerResponse {
    action: string;
    docs: DriveDocument[];
}
