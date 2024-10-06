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
import React, { useCallback, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FolderPicker } from '../../googleDrive/GoogleDrive';
import { googleDriveUploadFile } from '../../googleDrive/actions';
import { useSelector } from '../../reducers';
import { googleDriveUploadDialogDidCancel } from './actions';
import { useI18n } from './i18n';

const GoogleDriveUploadDialog: React.FunctionComponent = () => {
    const i18n = useI18n();
    const dispatch = useDispatch();
    const isOpen = useSelector((s) => s.explorer.googleDriveUploadDialog.isOpen);
    const fileName = useSelector((s) => s.explorer.googleDriveUploadDialog.fileName);
    const destFolder = useSelector(
        (s) => s.explorer.googleDriveUploadDialog.descFolder,
    );
    const uploadedDocId = useSelector(
        (s) => s.explorer.googleDriveUploadDialog.uploadedDocId,
    );
    const isUploadFailed = useSelector(
        (s) => s.explorer.googleDriveUploadDialog.isUploadFailed,
    );

    const inputRef = useRef<HTMLInputElement>(null);

    const [uploadStarted, setUploadStarted] = useState(false);
    const openFolderPicker = FolderPicker();

    const handleOpenPicker = () => {
        openFolderPicker();
    };

    const handleUpload = () => {
        setUploadStarted(true);
        if (!destFolder.folder) {
            return;
        }
        dispatch(googleDriveUploadFile(fileName, destFolder.folder.id));
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
                                value={destFolder.folder && destFolder.folder.name}
                                inputRef={inputRef}
                                disabled={true}
                                leftElement={
                                    destFolder.folder && (
                                        <Icon icon="folder-close"></Icon>
                                    )
                                }
                                rightElement={
                                    <div>
                                        {destFolder.folder && (
                                            <a
                                                target="_blank"
                                                href={destFolder.folder.url}
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
                    {uploadedDocId && destFolder.folder && (
                        <div>
                            Uploaded to: {destFolder.folder.name}/
                            <a
                                href={
                                    'https://drive.usercontent.google.com/download?id=' +
                                    uploadedDocId +
                                    '&export=download'
                                }
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
                            {uploadStarted &&
                                uploadedDocId === '' &&
                                !isUploadFailed && <Spinner size={24} />}
                            <Button
                                intent="primary"
                                onClick={handleUpload}
                                disabled={
                                    destFolder === undefined ||
                                    uploadedDocId !== '' ||
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
