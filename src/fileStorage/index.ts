// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import 'dexie-observable';
import Dexie, { Table } from 'dexie';

/** Type to avoid mixing UUID with regular string. */
export type UUID = string & { _uuidBrand: undefined };

/**
 * Database metadata table data type.
 *
 * IMPORTANT: if this type is changed, we need to modify the database schema to match
 */
export type FileMetadata = Readonly<{
    /** A globally unique identifier that serves a a file handle. */
    uuid: UUID;
    /** The path of the file in storage. */
    path: string;
    /** The SHA256 hash of the file contents. */
    sha256: string;
}>;

/**
 * Database contents table data type.
 *
 * IMPORTANT: if this type is changed, we need to modify the database schema to match
 */
type FileContents = {
    /** The path of the file in storage. */
    path: string;
    /** The contents of the file. */
    contents: string;
};

export class FileStorageDb extends Dexie {
    metadata!: Table<FileMetadata, UUID>;
    // NB: This table starts with an underscore to hide it from Dexie observable.
    // In the future we may change this to use File Access API or some other
    // storage, so we don't want to rely on the file contents being included
    // with the metadata.
    _contents!: Table<FileContents, string>;

    constructor(databaseName: string) {
        super(databaseName);
        this.version(1).stores({
            metadata: '$$uuid, &path, sha256',
            _contents: 'path, contents',
        });
    }
}
