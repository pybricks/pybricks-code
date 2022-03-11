// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

/** The Python file extension ('.py') */
export const pythonFileExtension = '.py';

/** The Python file MIME type ('text/x-python') */
export const pythonFileMimeType = 'text/x-python';

/** File name validation results. */
export enum FileNameValidationResult {
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
 * @param extension The file extension (including ".").
 * @param existingFiles List of existing files.
 * @returns The result of the validation.
 */
export function validateFileName(
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
