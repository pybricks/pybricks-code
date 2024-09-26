// SPDX-License-Identifier: MIT
// Copyright (c) 2024 The Pybricks Authors

import { Button, Classes, Dialog } from '@blueprintjs/core';
//import GoogleDrivePicker from 'google-drive-picker';
import React, { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../reducers';
import {
    googleDriveUploadDialogDidAccept,
    googleDriveUploadDialogDidCancel,
} from './actions';
import { useI18n } from './i18n';

const GoogleDriveUploadDialog: React.FunctionComponent = () => {
    const i18n = useI18n();
    const dispatch = useDispatch();
    const isOpen = useSelector((s) => s.explorer.googleDriveUploadDialog.isOpen);
    const fileName = useSelector((s) => s.explorer.googleDriveUploadDialog.fileName);

    const inputRef = useRef<HTMLInputElement>(null);

    //const [authToken, setAuthToken] = useState('');
    //const [openPicker, authResponse] = GoogleDrivePicker();

    const handlePickerOpen = () => {
        // openPicker({
        //     clientId:
        //         '1034337501504-of3um354h2dsdm200bhjnfpk6cg0m0n6.apps.googleusercontent.com',
        //     developerKey: 'AIzaSyBMKnuqNI3N0r95XNns1tT7TYJHGkM5juU',
        //     viewId: 'FOLDERS',
        //     //token: authToken,
        //     setSelectFolderEnabled: true,
        //     supportDrives: true,
        //     callbackFunction: (data) => {
        //         if (data.action === 'cancel') {
        //             console.log('User clicked cancel/close button');
        //         } else if (data.docs && data.docs.length > 0) {
        //             console.log(data);
        //         }
        //     },
        // });
    };

    // useEffect(() => {
    //     if (authResponse) {
    //         //setAuthToken(authResponse.access_token);
    //     }
    // }, [authResponse]);

    const handleSubmit = useCallback<React.FormEventHandler>(
        (e) => {
            e.preventDefault();
            dispatch(googleDriveUploadDialogDidAccept());
        },
        [dispatch],
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
                    Upload to: {}
                    <Button onClick={handlePickerOpen}>Choose destination</Button>
                    <div>body</div>
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
