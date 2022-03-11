// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import {
    Button,
    Classes,
    Dialog,
    FormGroup,
    InputGroup,
    Radio,
    RadioGroup,
    Tag,
} from '@blueprintjs/core';
import { useI18n } from '@shopify/react-i18n';
import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    FileNameValidationResult,
    pythonFileExtension,
    validateFileName,
} from '../pybricksMicropython/lib';
import { useSelector } from '../reducers';
import { Hub, explorerCreateNewFile } from './actions';
import { NewFileWizardStringId } from './i18n';
import en from './i18n.en.json';

// This should be set to the most commonly used hub.
const defaultHub = Hub.Technic;

type FileNameHelpTextProps = {
    validation: FileNameValidationResult;
};

/**
 * Component that maps FileNameValidationResult to help message to display to user.
 */
const FileNameHelpText: React.VoidFunctionComponent<FileNameHelpTextProps> = (
    props,
) => {
    const [i18n] = useI18n({ id: 'newFileWizard', translations: { en }, fallback: en });

    switch (props.validation) {
        case FileNameValidationResult.IsOk:
            return <>{i18n.translate(NewFileWizardStringId.FileNameHelpTextIsOk)}</>;
        case FileNameValidationResult.IsEmpty:
            return <>{i18n.translate(NewFileWizardStringId.FileNameHelpTextIsEmpty)}</>;
        case FileNameValidationResult.HasSpaces:
            return (
                <>{i18n.translate(NewFileWizardStringId.FileNameHelpTextHasSpaces)}</>
            );
        case FileNameValidationResult.HasFileExtension:
            return (
                <>
                    {i18n.translate(
                        NewFileWizardStringId.FileNameHelpTextHasFileExtension,
                    )}
                </>
            );
        case FileNameValidationResult.HasInvalidFirstCharacter:
            return (
                <>
                    {i18n.translate(
                        NewFileWizardStringId.FileNameHelpTextHasInvalidFirstCharacter,
                        {
                            letters: <code className={Classes.CODE}>a…z</code>,
                            underscore: <code className={Classes.CODE}>_</code>,
                        },
                    )}
                </>
            );
        case FileNameValidationResult.HasInvalidCharacters:
            return (
                <>
                    {i18n.translate(
                        NewFileWizardStringId.FileNameHelpTextHasInvalidCharacters,
                        {
                            letters: <code className={Classes.CODE}>a…z</code>,
                            numbers: <code className={Classes.CODE}>0…9</code>,
                            dash: <code className={Classes.CODE}>-</code>,
                            underscore: <code className={Classes.CODE}>_</code>,
                        },
                    )}
                </>
            );
        case FileNameValidationResult.AlreadyExists:
            return (
                <>
                    {i18n.translate(
                        NewFileWizardStringId.FileNameHelpTextAlreadyExists,
                    )}
                </>
            );
    }
};

type NewFileWizardProps = {
    readonly isOpen: boolean;
    readonly onClose: () => void;
};

const NewFileWizard: React.VoidFunctionComponent<NewFileWizardProps> = (props) => {
    const [i18n] = useI18n({ id: 'newFileWizard', translations: { en }, fallback: en });
    const dispatch = useDispatch();
    const fileNames = useSelector((s) => s.fileStorage.fileNames);

    const [fileName, setFileName] = useState('');
    const [fileNameValidation, setFileNameValidation] = useState(
        FileNameValidationResult.IsEmpty,
    );
    const [hubType, setHubType] = useState(defaultHub);

    const fileNameInputRef = useRef<HTMLInputElement>(null);

    const fileNameIntent =
        fileNameValidation === FileNameValidationResult.IsOk ? 'none' : 'danger';

    const handleFileNameChanged = (fileName: string) => {
        setFileNameValidation(
            validateFileName(fileName, pythonFileExtension, fileNames),
        );
        setFileName(fileName);
    };

    return (
        <Dialog
            icon="plus"
            title={i18n.translate(NewFileWizardStringId.Title)}
            isOpen={props.isOpen}
            onOpening={() => handleFileNameChanged('')}
            onOpened={() => fileNameInputRef.current?.focus()}
            onClose={() => props.onClose()}
        >
            <div className={Classes.DIALOG_BODY}>
                <FormGroup
                    label={i18n.translate(NewFileWizardStringId.FileNameLabel)}
                    intent={fileNameIntent}
                    subLabel={<FileNameHelpText validation={fileNameValidation} />}
                >
                    <InputGroup
                        aria-label="File name"
                        value={fileName}
                        inputRef={fileNameInputRef}
                        intent={fileNameIntent}
                        rightElement={<Tag>{pythonFileExtension}</Tag>}
                        onChange={(e) => handleFileNameChanged(e.target.value)}
                    />
                </FormGroup>
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
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                            props.onClose();
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
