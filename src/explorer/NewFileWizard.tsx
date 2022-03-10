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
import { useSelector } from '../reducers';
import { FileExtension, Hub, explorerCreateNewFile } from './actions';
import { NewFileWizardStringId } from './i18n';
import en from './i18n.en.json';

// This should be set to the most commonly used hub.
const defaultHub = Hub.Technic;

/** File name validation results. */
enum FileNameValidationResult {
    /** The file name is acceptable. */
    IsOk,
    /** The file name is an empty string. */
    IsEmpty,
    /** The file name contains spaces. */
    HasSpaces,
    /** The file name include the file file extension. */
    HasFileExtension,
    /** The first character is not a letter or underscore. */
    HasInvalidFirstCharacter,
    /** The file name has invalid characters. */
    HasInvalidCharacters,
    /** A file with the same name already exists. */
    AlreadyExists,
}

/**
 * Validates the file name according to a number of criteria.
 *
 * @param fileName The file name (without extension).
 * @param extension The file extension (include ".").
 * @param existingFiles List of existing files.
 * @returns The result of the validation.
 */
function validateFileName(
    fileName: string,
    extension: string,
    existingFiles: ReadonlyArray<string>,
): FileNameValidationResult {
    if (existingFiles.includes(`${fileName}${extension}`)) {
        return FileNameValidationResult.AlreadyExists;
    }

    if (fileName.length === 0) {
        return FileNameValidationResult.IsEmpty;
    }

    if (fileName.match(/\s/)) {
        return FileNameValidationResult.HasSpaces;
    }

    if (fileName.endsWith(extension)) {
        return FileNameValidationResult.HasFileExtension;
    }

    if (!fileName.match(/^[a-zA-Z_]/)) {
        return FileNameValidationResult.HasInvalidFirstCharacter;
    }

    if (!fileName.match(/^[a-zA-Z0-9_-]+$/)) {
        return FileNameValidationResult.HasInvalidCharacters;
    }

    return FileNameValidationResult.IsOk;
}

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
            validateFileName(fileName, FileExtension.Python, fileNames),
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
                        rightElement={<Tag>{FileExtension.Python}</Tag>}
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
                                    FileExtension.Python,
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
