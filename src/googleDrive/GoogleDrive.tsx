// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import GoogleDrivePicker from 'google-drive-picker';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocalStorage } from 'usehooks-ts';
import { googleApiKey, googleClientId } from '../app/constants';
import { pythonFileMimeType } from '../pybricksMicropython/lib';
import {
    googleDriveDidSelectDownloadFiles,
    googleDriveDidSelectFolder,
} from './actions';
import { DriveDocument, PickerResponse } from './protocol';
import { getOauthToken, setOauthToken } from './utils';

export default function DownloadPicker() {
    const [pickedDocs, setPickedDocs] = useState<DriveDocument[]>([]);
    const [openPicker, authResponse] = GoogleDrivePicker();
    const dispatch = useDispatch();
    const [lastGoogleDriveFolder] = useLocalStorage('googledrive.selectedFolder', '');

    const openDownloadPicker = () => {
        // TODO: remove after debugging.
        console.log(
            'stored_token: ',
            sessionStorage.getItem('google_oauth_token_expiration'),
            ', ',
            sessionStorage.getItem('google_oauth_token'),
        );
        const authToken = getOauthToken();
        const folderId = (() => {
            try {
                return JSON.parse(lastGoogleDriveFolder)?.id;
            } catch {
                return undefined;
            }
        })();
        openPicker({
            clientId: googleClientId,
            developerKey: googleApiKey,
            viewId: 'DOCS',
            viewMimeTypes: pythonFileMimeType,
            token: authToken,
            customScopes: ['https://www.googleapis.com/auth/drive'],
            setIncludeFolders: true,
            setSelectFolderEnabled: false,
            multiselect: true,
            supportDrives: true,
            setParentFolder: folderId,
            callbackFunction: (data: PickerResponse) => {
                console.log(data);
                if (data.action === 'picked' && data.docs) {
                    // TODO get parent folder: GET https://www.googleapis.com/drive/v2/files/{fileId}/parents/{parentId}
                    // setLastGoogleDriveFolder(JSON.stringify(parentFolder));
                    if (authToken) {
                        dispatch(googleDriveDidSelectDownloadFiles(data.docs));
                    } else {
                        setPickedDocs(data.docs);
                    }
                } else {
                    console.log('cancelled, nothing happens.');
                }
            },
        });
    };

    // When auth token is not available, need to wait for the auth token to be available until dispatching DidSelectDownloadFiles
    useEffect(() => {
        if (authResponse) {
            setOauthToken(authResponse.access_token, authResponse.expires_in);
            if (pickedDocs) {
                dispatch(googleDriveDidSelectDownloadFiles(pickedDocs));
            }
        }
    }, [authResponse, pickedDocs, dispatch]);
    return openDownloadPicker;
}

export function FolderPicker() {
    const [openPicker, authResponse] = GoogleDrivePicker();
    const dispatch = useDispatch();
    const [, setLastGoogleDriveFolder] = useLocalStorage(
        'googledrive.selectedFolder',
        '',
    );

    const openFolderPicker = () => {
        // const folderId = (() => {
        //     try {
        //         return JSON.parse(lastGoogleDriveFolder)?.id;
        //     } catch {
        //         return undefined;
        //     }
        // })();
        openPicker({
            clientId: googleClientId,
            developerKey: googleApiKey,
            viewId: 'FOLDERS',
            token: getOauthToken(),
            customScopes: ['https://www.googleapis.com/auth/drive'],
            setSelectFolderEnabled: true,
            supportDrives: true,
            // setParentFolder: folderId,
            callbackFunction: (data: PickerResponse) => {
                if (data.action === 'picked' && data.docs) {
                    setLastGoogleDriveFolder(JSON.stringify(data.docs[0]));
                    dispatch(googleDriveDidSelectFolder(data.docs[0]));
                }
            },
        });
    };

    useEffect(() => {
        if (authResponse) {
            setOauthToken(authResponse.access_token, authResponse.expires_in);
        }
    }, [authResponse]);

    return openFolderPicker;
}
