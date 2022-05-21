// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import {
    Button,
    Classes,
    Dialog,
    FormGroup,
    Radio,
    RadioGroup,
} from '@blueprintjs/core';
import React, { useCallback, useRef, useState } from 'react';
import { useId } from 'react-aria';
import { useDispatch } from 'react-redux';
import { useFileStorageMetadata } from '../../fileStorage/hooks';
import {
    FileNameValidationResult,
    pythonFileExtension,
    validateFileName,
} from '../../pybricksMicropython/lib';
import { useSelector } from '../../reducers';
import FileNameFormGroup from '../fileNameFormGroup/FileNameFormGroup';
import { Hub, newFileWizardDidAccept, newFileWizardDidCancel } from './actions';
import { I18nId, useI18n } from './i18n';

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
            title={i18n.translate(I18nId.Title)}
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
                    <FormGroup label={i18n.translate(I18nId.SmartHubLabel)}>
                        <RadioGroup
                            selectedValue={hubType}
                            onChange={(e) => setHubType(e.currentTarget.value as Hub)}
                        >
                            <Radio value={Hub.Move}>BOOST Move Hub</Radio>
                            <Radio value={Hub.City}>City Hub</Radio>
                            <Radio value={Hub.Technic}>Technic Hub</Radio>
                            <Radio value={Hub.Prime}>SPIKE Prime</Radio>
                            <Radio value={Hub.Essential}>SPIKE Essential</Radio>
                            <Radio value={Hub.Inventor}>
                                MINDSTORMS Robot Inventor
                            </Radio>
                        </RadioGroup>
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
                                {i18n.translate(I18nId.ActionCreate)}
                            </span>
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};

export default NewFileWizard;
