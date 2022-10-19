// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { useLiveQuery } from 'dexie-react-hooks';
import { useContext } from 'react';
import { FileStorageContext } from './context';
import { FileMetadata, UUID } from '.';

/**
 * Gets all file metadata for all files currently in storage.
 *
 * The returned array is sorted by the path.
 */
export function useFileStorageMetadata(): FileMetadata[] | undefined {
    const db = useContext(FileStorageContext);
    return useLiveQuery(() => db.metadata.orderBy('path').toArray());
}

/**
 * Gets the file path for a file UUID.
 *
 * If the file is renamed, the returned value will be automatically updated.
 */
export function useFileStoragePath(uuid: UUID): string | undefined {
    const db = useContext(FileStorageContext);
    return useLiveQuery(() => db.metadata.get(uuid, (x) => x?.path));
}

/**
 * Gets the file path for a file UUID.
 *
 * If the file is renamed, the returned value will be automatically updated.
 */
export function useFileStorageUuid(path: string): UUID | undefined {
    const db = useContext(FileStorageContext);
    return useLiveQuery(() =>
        db.metadata
            .where('path')
            .equals(path)
            .first((x) => x?.uuid),
    );
}
