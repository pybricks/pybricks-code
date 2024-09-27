// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import { put, race, take, takeEvery } from 'typed-redux-saga/macro';
import {
    fileStorageDidFailToReadFile,
    fileStorageDidReadFile,
    fileStorageReadFile,
} from '../../fileStorage/actions';
import { defined, ensureError } from '../../utils';

import {
    googleDriveUploadDialogDidUploadFile,
    googleDriveUploadDialogFailedToUploadFile,
    googleDriveUploadDialogUpload,
} from './actions';

function* handleGoogleDriveUploadDialogUploadFile(
    action: ReturnType<typeof googleDriveUploadDialogUpload>,
): Generator {
    try {
        yield* put(fileStorageReadFile(action.fileName));
        console.log(action);

        const { didRead, didFailToRead } = yield* race({
            didRead: take(
                fileStorageDidReadFile.when((a) => a.path === action.fileName),
            ),
            didFailToRead: take(
                fileStorageDidFailToReadFile.when((a) => a.path === action.fileName),
            ),
        });

        if (didFailToRead) {
            throw didFailToRead.error;
        }

        defined(didRead);

        const form = new FormData();
        form.append(
            'metadata',
            new Blob(
                [
                    JSON.stringify({
                        name: action.fileName,
                        mimeType: 'text/plain',
                        parents: [action.targetFolderId],
                    }),
                ],
                { type: 'application/json' },
            ),
        );
        form.append('file', new Blob([didRead.contents], { type: 'text/plain' }));

        const xhr = new XMLHttpRequest();
        xhr.open(
            'post',
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
        );
        xhr.setRequestHeader('Authorization', 'Bearer ' + action.authToken);
        xhr.responseType = 'json';
        xhr.onload = () => {
            console.log('Google drive file id:', xhr.response.id);
        };
        xhr.onerror = (event) => {
            console.log('Failed to upload file to Google Drive:', event);
        };
        xhr.send(form);

        // TBD
        yield* put(googleDriveUploadDialogDidUploadFile(xhr.response.id));
    } catch (err) {
        console.log('Failed to upload file to Google Drive:', err);
        yield* put(googleDriveUploadDialogFailedToUploadFile(ensureError(err)));
    }
}

export default function* (): Generator {
    yield* takeEvery(
        googleDriveUploadDialogUpload,
        handleGoogleDriveUploadDialogUploadFile,
    );
}
