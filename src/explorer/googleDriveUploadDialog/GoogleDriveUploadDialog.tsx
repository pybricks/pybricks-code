// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import { Button, Classes, Dialog } from '@blueprintjs/core';
import GoogleDrivePicker from 'google-drive-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../reducers';
import {
    googleDriveUploadDialogDidAccept,
    googleDriveUploadDialogDidCancel,
} from './actions';
import { useI18n } from './i18n';

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

export interface PickerResponse {
    action: string;
    docs: DriveDocument[];
}

const GoogleDriveUploadDialog: React.FunctionComponent = () => {
    const i18n = useI18n();
    const dispatch = useDispatch();
    const isOpen = useSelector((s) => s.explorer.googleDriveUploadDialog.isOpen);
    const fileName = useSelector((s) => s.explorer.googleDriveUploadDialog.fileName);

    const inputRef = useRef<HTMLInputElement>(null);

    const [authToken, setAuthToken] = useState('');
    const [openPicker, authRes] = GoogleDrivePicker();
    const [dest, setDest] = useState<DriveDocument>();

    const handlePickerOpen = () => {
        console.log('token:', authToken);
        openPicker({
            clientId:
                '1034337501504-of3um354h2dsdm200bhjnfpk6cg0m0n6.apps.googleusercontent.com',
            developerKey: 'AIzaSyBMKnuqNI3N0r95XNns1tT7TYJHGkM5juU',
            viewId: 'FOLDERS',
            token: authToken,
            customScopes: ['https://www.googleapis.com/auth/drive'],
            setSelectFolderEnabled: true,
            supportDrives: true,
            callbackFunction: (data: PickerResponse) => {
                if (data.action === 'cancel') {
                    console.log('User clicked cancel/close button');
                }
                console.log(data);
                if (data && data.docs) {
                    setDest(data.docs[0]);
                }
            },
        });
        console.log('token:', authToken);
    };

    useEffect(() => {
        if (authRes) {
            setAuthToken(authRes.access_token);
        }
    }, [authRes]);

    const handleSubmit = useCallback<React.FormEventHandler>(
        (e) => {
            e.preventDefault();
            console.log('upload: %s, %s', fileName, authToken);

            // const drive = new TsGoogleDrive({
            //     oAuthCredentials: { access_token: authToken },
            // });
            // console.log(drive);
            // drive.upload(fileName);

            dispatch(googleDriveUploadDialogDidAccept());
        },
        [dispatch, authToken, fileName],
    );

    const handleClose = useCallback(() => {
        dispatch(googleDriveUploadDialogDidCancel());
    }, [dispatch]);

    return (
        <Dialog
            title={i18n.translate('title', { fileName: fileName })}
            isOpen={isOpen}
            onOpened={() => {
                inputRef.current?.select();
                inputRef.current?.focus();
            }}
            onClose={handleClose}
        >
            <form onSubmit={handleSubmit}>
                <div className={Classes.DIALOG_BODY}>
                    <div>
                        Upload to:
                        {dest && (
                            <div>
                                <a target="_blank" href={dest.url} rel="noopener">
                                    <img src={dest.iconUrl}></img>
                                    {dest.name}
                                </a>
                            </div>
                        )}
                        <Button onClick={handlePickerOpen}>
                            {(dest && 'Change') || 'Choose'} destination
                        </Button>
                    </div>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button intent="primary" type="submit">
                            {i18n.translate('action.upload')}
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};

export default GoogleDriveUploadDialog;
