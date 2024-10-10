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
import { getOauthToken } from './utils';

function* handleDownloadFile(
    action: ReturnType<typeof googleDriveDownloadFile>,
): Generator {
    try {
        const authToken = getOauthToken();

        defined(authToken);

        const downloadFile = new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const url =
                'https://www.googleapis.com/drive/v3/files/' +
                action.file.id +
                '?alt=media';
            xhr.open('GET', url);
            xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
            xhr.onload = () => {
                console.info('onload');
                resolve(xhr.responseText);
            };
            xhr.onerror = (err) => {
                console.info('error:', xhr.response);
                reject(err);
            };
            xhr.send();
        });
        const content = yield* call(() => downloadFile);
        yield* put(googleDriveDidDownloadFile(action.file, content));
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

        //----

        const authToken = getOauthToken();

        defined(authToken);

        const downloadFile = new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const url =
                'https://www.googleapis.com/drive/v3/files?fields=files(id)&q=' +
                encodeURIComponent(
                    `name='${action.fileName}' and '${action.targetFolderId}' in parents`,
                );
            xhr.open('GET', url);
            xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
            xhr.responseType = 'json';
            xhr.onload = () => {
                console.log(xhr.response);
                resolve(xhr.response.files[0]?.id);
            };
            xhr.onerror = (err) => {
                console.info('error:', xhr.response);
                reject(err);
            };
            xhr.send();
        });
        const existing_file_id = yield* call(() => downloadFile);
        console.log(`existing file: ${existing_file_id}`);

        //----

        const form = new FormData();
        form.append(
            'metadata',
            new Blob(
                [
                    JSON.stringify({
                        name: action.fileName,
                        description: 'Pybricks Python file',
                        mimeType: pythonFileMimeType,
                        ...(!existing_file_id
                            ? { parents: [action.targetFolderId] }
                            : {}),
                        //starred: true,
                    }),
                ],
                { type: 'application/json' },
            ),
        );
        form.append('file', new Blob([didRead.contents], { type: pythonFileMimeType }));

        // overwrite: PUT https://www.googleapis.com/upload/drive/v3/files/[FILE_ID]

        const uploadFile = new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const method = existing_file_id ? 'PATCH' : 'POST';
            const url =
                'https://www.googleapis.com/upload/drive/v3/files' +
                (existing_file_id ? `/${existing_file_id}` : '') +
                '?uploadType=multipart&fields=id';
            console.info(url);
            xhr.open(method, url);
            xhr.setRequestHeader('Authorization', 'Bearer ' + authToken);
            xhr.responseType = 'json';
            xhr.onload = () => {
                console.log(xhr.response);
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
