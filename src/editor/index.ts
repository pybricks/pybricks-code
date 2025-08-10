// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import { UUID } from '../fileStorage';

/**
 * LocalStorage recent files data type.
 */
export type RecentFileMetadata = Readonly<{
    /** A globally unique identifier that serves a a file handle. */
    uuid: UUID;
    /** The path of the file in storage. */
    path: string;
}>;
