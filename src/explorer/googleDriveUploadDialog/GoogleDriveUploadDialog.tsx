// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import { Button, Classes, Dialog, Spinner } from '@blueprintjs/core';
import GoogleDrivePicker from 'google-drive-picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../reducers';
import {
    googleDriveUploadDialogDidCancel,
    googleDriveUploadDialogUpload,
} from './actions';
import { useI18n } from './i18n';
import { DriveDocument, PickerResponse } from './protocol';

const GoogleDriveUploadDialog: React.FunctionComponent = () => {
    const i18n = useI18n();
    const dispatch = useDispatch();
    const isOpen = useSelector((s) => s.explorer.googleDriveUploadDialog.isOpen);
    const fileName = useSelector((s) => s.explorer.googleDriveUploadDialog.fileName);

    const inputRef = useRef<HTMLInputElement>(null);

    const [authToken, setAuthToken] = useState('');
    const [openPicker, authRes] = GoogleDrivePicker();
    const [dest, setDest] = useState<DriveDocument>();
    const [uploading, setUploading] = useState(false);

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

    const handleUpload = () => {
        setUploading(true);
        dispatch(googleDriveUploadDialogUpload(fileName, authToken, dest?.id || ''));

        setTimeout(() => {
            setUploading(false);
            dispatch(googleDriveUploadDialogDidCancel());
        }, 500);
    };

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
            <form>
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
                            {(dest && i18n.translate('action.change_destination')) ||
                                i18n.translate('action.choose_destination')}
                        </Button>
                    </div>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        {uploading && <Spinner size={24} />}
                        <Button
                            intent="primary"
                            onClick={handleUpload}
                            disabled={(dest === undefined && true) || false}
                        >
                            {i18n.translate('action.upload')}
                        </Button>
                        <Button intent="primary" onClick={handleClose}>
                            Done
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};

export default GoogleDriveUploadDialog;
