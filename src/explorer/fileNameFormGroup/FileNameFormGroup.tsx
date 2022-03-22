// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Classes, FormGroup, InputGroup, Intent, Tag } from '@blueprintjs/core';
import { I18n, useI18n } from '@shopify/react-i18n';
import React from 'react';
import { FileNameValidationResult } from '../../pybricksMicropython/lib';
import { I18nId } from './i18n';

type FileNameHelpTextProps = {
    /** The result of the file name validation. */
    validation: FileNameValidationResult;
    /** Translation context. */
    i18n: I18n;
};

/**
 * Component that maps FileNameValidationResult to help message to display to user.
 */
const FileNameHelpText: React.VoidFunctionComponent<FileNameHelpTextProps> = ({
    validation,
    i18n,
}) => {
    switch (validation) {
        case FileNameValidationResult.IsOk:
            return <>{i18n.translate(I18nId.HelpTextIsOk)}</>;
        case FileNameValidationResult.IsEmpty:
            return <>{i18n.translate(I18nId.HelpTextIsEmpty)}</>;
        case FileNameValidationResult.HasSpaces:
            return <>{i18n.translate(I18nId.HelpTextHasSpaces)}</>;
        case FileNameValidationResult.HasFileExtension:
            return <>{i18n.translate(I18nId.HelpTextHasFileExtension)}</>;
        case FileNameValidationResult.HasInvalidFirstCharacter:
            return (
                <>
                    {i18n.translate(I18nId.HelpTextHasInvalidFirstCharacter, {
                        letters: <code className={Classes.CODE}>a…z</code>,
                        underscore: <code className={Classes.CODE}>_</code>,
                    })}
                </>
            );
        case FileNameValidationResult.HasInvalidCharacters:
            return (
                <>
                    {i18n.translate(I18nId.HelpTextHasInvalidCharacters, {
                        letters: <code className={Classes.CODE}>a…z</code>,
                        numbers: <code className={Classes.CODE}>0…9</code>,
                        dash: <code className={Classes.CODE}>-</code>,
                        underscore: <code className={Classes.CODE}>_</code>,
                    })}
                </>
            );
        case FileNameValidationResult.AlreadyExists:
            return <>{i18n.translate(I18nId.HelpTextAlreadyExists)}</>;
    }
};

type FileNameFormGroupProps = {
    /** The file name in the input (without file extension). */
    readonly fileName: string;
    /** The file extension (including leading ".") */
    readonly fileExtension: string;
    /** The result of the file name validation. */
    readonly validationResult: FileNameValidationResult;
    /** Ref to get handle to input (e.g to be able to call focus()) */
    readonly inputRef?: React.RefObject<HTMLInputElement>;
    /** Called when the user changes the text in the input box. */
    readonly onChange: (newName: string) => void;
};

/**
 * Component used to get a valid new file name.
 */
const FileNameFormGroup: React.VoidFunctionComponent<FileNameFormGroupProps> = ({
    fileName,
    fileExtension,
    validationResult,
    inputRef,
    onChange,
}) => {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();

    const fileNameIntent =
        validationResult === FileNameValidationResult.IsOk
            ? Intent.NONE
            : Intent.DANGER;

    return (
        <FormGroup
            label={i18n.translate(I18nId.Label)}
            intent={fileNameIntent}
            subLabel={<FileNameHelpText validation={validationResult} i18n={i18n} />}
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
