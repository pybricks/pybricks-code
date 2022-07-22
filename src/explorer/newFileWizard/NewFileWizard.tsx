// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Button, Classes, Dialog, FormGroup } from '@blueprintjs/core';
import React, { useCallback, useRef, useState } from 'react';
import { useId } from 'react-aria';
import { useDispatch } from 'react-redux';
import { Hub } from '../../components/hubPicker';
import { HubPicker } from '../../components/hubPicker/HubPicker';
import { useFileStorageMetadata } from '../../fileStorage/hooks';
import {
    FileNameValidationResult,
    pythonFileExtension,
    validateFileName,
} from '../../pybricksMicropython/lib';
import { useSelector } from '../../reducers';
import FileNameFormGroup from '../fileNameFormGroup/FileNameFormGroup';
import { newFileWizardDidAccept, newFileWizardDidCancel } from './actions';
import { useI18n } from './i18n';

// This should be set to the most commonly used hub.
const defaultHub = Hub.Technic;

const NewFileWizard: React.VoidFunctionComponent = () => {
    const i18n = useI18n();
    const dispatch = useDispatch();

    const isOpen = useSelector((s) => s.explorer.newFileWizard.isOpen);
    const [fileName, setFileName] = useState('');
    const files = useFileStorageMetadata() ?? [];
    const fileNameValidation = validateFileName(
        fileName,
        pythonFileExtension,
        files.map((f) => f.path),
    );
    const [hubType, setHubType] = useState(defaultHub);

    const fileNameInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = useCallback<React.FormEventHandler>(
        (e) => {
            e.preventDefault();
            dispatch(newFileWizardDidAccept(fileName, pythonFileExtension, hubType));
        },
        [dispatch, fileName, pythonFileExtension, hubType],
    );

    const handleClose = useCallback(() => {
        dispatch(newFileWizardDidCancel());
    }, [dispatch]);

    const acceptButtonLabelId = useId();

    return (
        <Dialog
            icon="plus"
            title={i18n.translate('title')}
            isOpen={isOpen}
            onOpening={() => setFileName('')}
            onOpened={() => fileNameInputRef.current?.focus()}
            onClose={handleClose}
        >
            <form onSubmit={handleSubmit}>
                <div className={Classes.DIALOG_BODY}>
                    <FileNameFormGroup
                        fileName={fileName}
                        fileExtension={pythonFileExtension}
                        validationResult={fileNameValidation}
                        inputRef={fileNameInputRef}
                        onChange={setFileName}
                    />
                    <FormGroup label={i18n.translate('smartHub.label')}>
                        <HubPicker hubType={hubType} onChange={setHubType} />
                    </FormGroup>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button
                            aria-labelledby={acceptButtonLabelId}
                            intent="primary"
                            disabled={
                                fileNameValidation !== FileNameValidationResult.IsOk
                            }
                            type="submit"
                        >
                            <span id={acceptButtonLabelId}>
                                {i18n.translate('action.create')}
                            </span>
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};

export default NewFileWizard;
