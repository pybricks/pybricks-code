// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Classes, FormGroup, InputGroup, Intent, Tag } from '@blueprintjs/core';
import type { AriaButtonProps } from '@react-types/button';
import React, { useCallback, useRef } from 'react';
import { useButton } from 'react-aria';
import { FileNameValidationResult } from '../../pybricksMicropython/lib';
import { I18nId, useI18n } from './i18n';

/**
 * Trims trailing and leading whitespace and replaces additional whitespace
 * with underscores.
 * @param value The input string.
 * @returns The fixed up string.
 */
function replaceSpaces(value: string): string {
    return value.trim().replaceAll(/\s+/g, '_');
}

/**
 * Removes the file extension from a string.
 * @param value The input string.
 * @returns The fixed up string.
 */
function removeFileExtension(value: string): string {
    return value.replace(/\.\w+$/, '');
}

/**
 * Trims trailing and leading whitespace and replaces groups of invalid
 * characters with underscores.
 * @param value The input string.
 * @returns The fixed up string.
 */
function replaceInvalidCharacters(value: string): string {
    return value.trim().replaceAll(/[^A-Za-z0-9-_]+/g, '_');
}

type FixItButtonProps = Pick<AriaButtonProps<'a'>, 'onPress'>;

const FixItButton: React.VoidFunctionComponent<FixItButtonProps> = (props) => {
    const i18n = useI18n();
    const ref = useRef<HTMLAnchorElement>(null);

    const { buttonProps } = useButton(
        {
            ...props,
            elementType: 'a',
        },
        ref,
    );

    return <a {...buttonProps}>{i18n.translate(I18nId.HelpTextFixIt)}</a>;
};

type FileNameHelpTextProps = {
    /** The file name in the input (without file extension). */
    fileName: string;
    /** The result of the file name validation. */
    validation: FileNameValidationResult;
    /** Called when the "fix it" link is clicked. */
    onFix: (newName: string) => void;
};

/**
 * Component that maps FileNameValidationResult to help message to display to user.
 */
const FileNameHelpText: React.VoidFunctionComponent<FileNameHelpTextProps> = ({
    fileName,
    validation,
    onFix,
}) => {
    const i18n = useI18n();

    const handleHasSpaces = useCallback(() => {
        onFix(replaceSpaces(fileName));
    }, [fileName, onFix]);

    const handleHasFileExtension = useCallback(() => {
        onFix(removeFileExtension(fileName));
    }, [fileName, onFix]);

    const handleHasInvalidCharacters = useCallback(() => {
        onFix(replaceInvalidCharacters(fileName));
    }, [fileName, onFix]);

    switch (validation) {
        case FileNameValidationResult.IsOk:
            return <>{i18n.translate(I18nId.HelpTextIsOk)}</>;
        case FileNameValidationResult.IsEmpty:
            return <>{i18n.translate(I18nId.HelpTextIsEmpty)}</>;
        case FileNameValidationResult.HasSpaces:
            return (
                <>
                    {i18n.translate(I18nId.HelpTextHasSpaces)}{' '}
                    <FixItButton onPress={handleHasSpaces} />
                </>
            );
        case FileNameValidationResult.HasFileExtension:
            return (
                <>
                    {i18n.translate(I18nId.HelpTextHasFileExtension)}{' '}
                    <FixItButton onPress={handleHasFileExtension} />
                </>
            );
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
                    })}{' '}
                    <FixItButton onPress={handleHasInvalidCharacters} />
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
    const i18n = useI18n();

    const fileNameIntent =
        validationResult === FileNameValidationResult.IsOk
            ? Intent.NONE
            : Intent.DANGER;

    return (
        <FormGroup
            label={i18n.translate(I18nId.Label)}
            intent={fileNameIntent}
            subLabel={
                <FileNameHelpText
                    fileName={fileName}
                    validation={validationResult}
                    onFix={onChange}
                />
            }
        >
            <InputGroup
                aria-label="File name"
                value={fileName}
                inputRef={inputRef}
                intent={fileNameIntent}
                rightElement={<Tag aria-hidden>{fileExtension}</Tag>}
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => onChange(e.target.value)}
            />
        </FormGroup>
    );
};

export default FileNameFormGroup;
