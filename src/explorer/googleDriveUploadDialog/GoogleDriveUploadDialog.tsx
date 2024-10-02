// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import {
    Button,
    Classes,
    Dialog,
    FormGroup,
    Icon,
    InputGroup,
    Spinner,
} from '@blueprintjs/core';
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
    const driveDocId = useSelector(
        (s) => s.explorer.googleDriveUploadDialog.driveDocId,
    );
    const isUploadFailed = useSelector(
        (s) => s.explorer.googleDriveUploadDialog.isUploadFailed,
    );

    const inputRef = useRef<HTMLInputElement>(null);

    const [authToken, setAuthToken] = useState('');
    const [openPicker, authResponse] = GoogleDrivePicker();
    const [destFolder, setDestFolder] = useState<DriveDocument>();
    const [uploadStarted, setUploadStarted] = useState(false);

    const handleOpenPicker = () => {
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
                if (data.action === 'picked' && data.docs) {
                    setDestFolder(data.docs[0]);
                }
            },
        });
    };

    useEffect(() => {
        if (authResponse) {
            setAuthToken(authResponse.access_token);
        }
    }, [authResponse]);

    const handleUpload = () => {
        setUploadStarted(true);
        if (!destFolder) {
            return;
        }
        dispatch(googleDriveUploadDialogUpload(fileName, authToken, destFolder.id));
    };

    const handleClose = useCallback(() => {
        setUploadStarted(false);
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
                        <FormGroup
                            label={i18n.translate('upload_to')}
                            subLabel={i18n.translate('upload_to_sub_label')}
                        >
                            <InputGroup
                                aria-label="File name"
                                value={destFolder && destFolder.name}
                                inputRef={inputRef}
                                disabled={true}
                                leftElement={
                                    destFolder && <Icon icon="folder-close"></Icon>
                                }
                                rightElement={
                                    <div>
                                        {destFolder && (
                                            <a
                                                target="_blank"
                                                href={destFolder.url}
                                                rel="noopener"
                                            >
                                                <Button icon="share"></Button>
                                            </a>
                                        )}
                                        <Button onClick={handleOpenPicker}>
                                            {(destFolder &&
                                                i18n.translate(
                                                    'action.change_destination',
                                                )) ||
                                                i18n.translate(
                                                    'action.choose_destination',
                                                )}
                                        </Button>
                                    </div>
                                }
                                onMouseDown={(e) => e.stopPropagation()}
                            />
                        </FormGroup>
                    </div>
                    {driveDocId && destFolder && (
                        <div>
                            Uploaded to: {destFolder.name}/
                            <a
                                href="https://drive.usercontent.google.com/download?id={driveDocId}&export=download"
                                target="_blank"
                                rel="noopener"
                            >
                                {fileName}
                            </a>
                        </div>
                    )}
                    {isUploadFailed && <div>Upload failed.</div>}
                    <div className={Classes.DIALOG_FOOTER}>
                        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                            {uploadStarted && driveDocId === '' && !isUploadFailed && (
                                <Spinner size={24} />
                            )}
                            <Button
                                intent="primary"
                                onClick={handleUpload}
                                disabled={
                                    destFolder === undefined ||
                                    driveDocId !== '' ||
                                    uploadStarted ||
                                    false
                                }
                            >
                                {i18n.translate('action.upload')}
                            </Button>
                            <Button intent="primary" onClick={handleClose}>
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};

export default GoogleDriveUploadDialog;
