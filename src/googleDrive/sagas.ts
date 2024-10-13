// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors
// Copyright (c) 2024 The Pybricks Authors

import { call, put, race, take, takeEvery } from 'typed-redux-saga/macro';
import {
    fileStorageDidFailToReadFile,
    fileStorageDidReadFile,
    fileStorageReadFile,
} from '../fileStorage/actions';
import { pythonFileMimeType } from '../pybricksMicropython/lib';
import { defined, ensureError } from '../utils';
import {
    googleDriveDidDownloadFile,
    googleDriveDidUploadFile,
    googleDriveDownloadFile,
    googleDriveFailToDownloadFile,
    googleDriveFailedToUploadFile,
    googleDriveUploadFile,
} from './actions';
import { getStoredOauthToken } from './utils';

function* handleDownloadFile(
    action: ReturnType<typeof googleDriveDownloadFile>,
): Generator {
    try {
        console.log('handleDownloadFile');
        const url =
            'https://www.googleapis.com/drive/v3/files/' +
            action.file.id +
            '?alt=media';
        const fetchFileContent = fetch(url, {
            headers: {
                Authorization: 'Bearer ' + getStoredOauthToken(),
            },
        }).then((response) => {
            if (response.ok) {
                return response.text();
            }
            throw new Error(`Fetch error: ${response.status}`);
        });
        const fileContent = yield* call(() => fetchFileContent);
        yield* put(googleDriveDidDownloadFile(action.file, fileContent));
    } catch (err) {
        yield* put(googleDriveFailToDownloadFile(action.file));
    }
}

function* handleUploadFile(
    action: ReturnType<typeof googleDriveUploadFile>,
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
                        mimeType: pythonFileMimeType,
                        parents: [action.targetFolderId],
                    }),
                ],
                { type: 'application/json' },
            ),
        );
        form.append('file', new Blob([didRead.contents], { type: pythonFileMimeType }));

        const uploadFile = new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(
                'post',
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
            );
            xhr.setRequestHeader('Authorization', 'Bearer ' + getStoredOauthToken());
            xhr.responseType = 'json';
            xhr.onload = () => {
                console.log('Google drive file id:', xhr.response.id);
                resolve(xhr.response.id);
            };
            xhr.onerror = (event) => {
                console.log('Failed to upload file to Google Drive:', event);
                reject(event);
            };
            xhr.send(form);
        });

        const fileId = yield* call(() => uploadFile);

        yield* put(googleDriveDidUploadFile(fileId));
    } catch (err) {
        console.log('Failed to upload file to Google Drive:', err);
        yield* put(googleDriveFailedToUploadFile(ensureError(err)));
    }
}

export default function* (): Generator {
    yield* takeEvery(googleDriveDownloadFile, handleDownloadFile);
    yield* takeEvery(googleDriveUploadFile, handleUploadFile);
}
