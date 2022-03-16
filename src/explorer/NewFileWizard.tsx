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
import { useI18n } from '@shopify/react-i18n';
import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    FileNameValidationResult,
    pythonFileExtension,
} from '../pybricksMicropython/lib';
import FileNameFormGroup from './FileNameFormGroup';
import { Hub, explorerCreateNewFile } from './actions';
import { NewFileWizardStringId } from './i18n';
import en from './i18n.en.json';

// This should be set to the most commonly used hub.
const defaultHub = Hub.Technic;

type NewFileWizardProps = {
    /** Controls if the dialog is open. */
    readonly isOpen: boolean;
    /** Called when the dialog is closed. */
    readonly onClose: () => void;
};

const NewFileWizard: React.VoidFunctionComponent<NewFileWizardProps> = ({
    isOpen,
    onClose,
}) => {
    const [i18n] = useI18n({ id: 'explorer', translations: { en }, fallback: en });
    const dispatch = useDispatch();

    const [fileName, setFileName] = useState('');
    const [fileNameValidation, setFileNameValidation] = useState(
        FileNameValidationResult.Unknown,
    );
    const [hubType, setHubType] = useState(defaultHub);

    const fileNameInputRef = useRef<HTMLInputElement>(null);

    return (
        <Dialog
            icon="plus"
            title={i18n.translate(NewFileWizardStringId.Title)}
            isOpen={isOpen}
            onOpening={() => setFileName('')}
            onOpened={() => fileNameInputRef.current?.focus()}
            onClose={onClose}
        >
            <div className={Classes.DIALOG_BODY}>
                <FileNameFormGroup
                    fileName={fileName}
                    fileExtension={pythonFileExtension}
                    inputRef={fileNameInputRef}
                    onChange={setFileName}
                    onValidation={setFileNameValidation}
                />
                <FormGroup label={i18n.translate(NewFileWizardStringId.SmartHubLabel)}>
                    <RadioGroup
                        selectedValue={hubType}
                        onChange={(e) => setHubType(e.currentTarget.value as Hub)}
                    >
                        <Radio value={Hub.Move}>BOOST Move Hub</Radio>
                        <Radio value={Hub.City}>City Hub</Radio>
                        <Radio value={Hub.Technic}>Technic Hub</Radio>
                        <Radio value={Hub.Prime}>SPIKE Prime</Radio>
                        <Radio value={Hub.Essential}>SPIKE Essential</Radio>
                        <Radio value={Hub.Inventor}>MINDSTORMS Robot Inventor</Radio>
                    </RadioGroup>
                </FormGroup>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <Button
                        aria-label="Create"
                        intent="primary"
                        disabled={fileNameValidation !== FileNameValidationResult.IsOk}
                        onClick={() => {
                            onClose();
                            dispatch(
                                explorerCreateNewFile(
                                    fileName,
                                    pythonFileExtension,
                                    hubType,
                                ),
                            );
                        }}
                    >
                        {i18n.translate(NewFileWizardStringId.ActionCreate)}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default NewFileWizard;
