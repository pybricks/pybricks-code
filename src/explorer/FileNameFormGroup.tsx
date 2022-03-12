// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Classes, FormGroup, InputGroup, Intent, Tag } from '@blueprintjs/core';
import { useI18n } from '@shopify/react-i18n';
import React, { useMemo } from 'react';
import { FileNameValidationResult, validateFileName } from '../pybricksMicropython/lib';
import { useSelector } from '../reducers';
import { NewFileWizardStringId } from './i18n';
import en from './i18n.en.json';

type FileNameHelpTextProps = {
    /** The result of the file name validation. */
    validation: Exclude<FileNameValidationResult, FileNameValidationResult.Unknown>;
};

/**
 * Component that maps FileNameValidationResult to help message to display to user.
 */
const FileNameHelpText: React.VoidFunctionComponent<FileNameHelpTextProps> = ({
    validation,
}) => {
    const [i18n] = useI18n({ id: 'explorer', translations: { en }, fallback: en });

    switch (validation) {
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

type FileNameFormGroupProps = {
    /** The file name in the input (without file extension). */
    readonly fileName: string;
    /** The file extension (including leading ".") */
    readonly fileExtension: string;
    /** Ref to get handle to input (e.g to be able to call focus()) */
    readonly inputRef?: React.RefObject<HTMLInputElement>;
    /** Called when the user changes the text in the input box. */
    readonly onChange: (newName: string) => void;
    /** Called when `fileName` is validated. */
    readonly onValidation: (result: FileNameValidationResult) => void;
};

/**
 * Component used to get a valid new file name.
 */
const FileNameFormGroup: React.VoidFunctionComponent<FileNameFormGroupProps> = ({
    fileName,
    fileExtension,
    inputRef,
    onChange,
    onValidation,
}) => {
    const [i18n] = useI18n({ id: 'explorer', translations: { en }, fallback: en });
    const fileNames = useSelector((s) => s.fileStorage.fileNames);

    const [fileNameValidation, fileNameIntent] = useMemo(() => {
        const result = validateFileName(fileName, fileExtension, fileNames);

        // can't call callback now because it would break react, so defer it
        setTimeout(() => onValidation(result), 0);

        return [
            result,
            result === FileNameValidationResult.IsOk ? Intent.NONE : Intent.DANGER,
        ];
    }, [fileName, fileExtension, fileNames]);

    return (
        <FormGroup
            label={i18n.translate(NewFileWizardStringId.FileNameLabel)}
            intent={fileNameIntent}
            subLabel={<FileNameHelpText validation={fileNameValidation} />}
        >
            <InputGroup
                aria-label="File name"
                value={fileName}
                inputRef={inputRef}
                intent={fileNameIntent}
                rightElement={<Tag>{fileExtension}</Tag>}
                onChange={(e) => onChange(e.target.value)}
            />
        </FormGroup>
    );
};

export default FileNameFormGroup;
