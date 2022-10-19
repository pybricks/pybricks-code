// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { parse, walk } from 'python-ast';
import type { FileContents, FileStorageDb } from '../fileStorage';

/** The Python file extension ('.py') */
export const pythonFileExtension = '.py';

/** A regular expression that matches the Python file extension. */
export const pythonFileExtensionRegex = /\.[Pp][Yy]$/;

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

    if (!fileName.match(/^[a-zA-Z0-9_]+$/)) {
        return FileNameValidationResult.HasInvalidCharacters;
    }

    return FileNameValidationResult.IsOk;
}

/**
 * Finds modules imported by a Python script.
 *
 * @param py A Python Script.
 * @returns A list of the names of modules imported by this file.
 */
export function findImportedModules(py: string): ReadonlySet<string> {
    const modules = new Set<string>();
    const tree = parse(py);

    // find all import statements in the syntax tree and collect imported modules
    walk(
        {
            enterImport_stmt: (ctx) => {
                // import statements have two forms:
                // import_stmt: import_name | import_from;

                // import_name: 'import' dotted_as_names
                const name = ctx.import_name();

                if (name) {
                    // dotted_as_names: dotted_as_name (',' dotted_as_name)*;
                    // dotted_as_name: dotted_name ('as' NAME)?;
                    for (const dottedAsName of name
                        .dotted_as_names()
                        .dotted_as_name()) {
                        // dotted_name: NAME ('.' NAME)*;
                        modules.add(dottedAsName.dotted_name().text);
                    }
                }

                // import_from: ('from' (('.' | '...')* dotted_name | ('.' | '...')+) 'import' ('*' | '(' import_as_names ')' | import_as_names ));
                const from = ctx.import_from();

                if (from) {
                    // the leading dots aren't included in dotted_name, so
                    // we need to collect them separately
                    const leadingDots = from
                        .DOT()
                        .concat(from.ELLIPSIS())
                        .map((n) => n.symbol.text)
                        .join('');

                    // dotted_name: NAME ('.' NAME)*;
                    const dottedName = from.dotted_name()?.text ?? '';

                    modules.add(leadingDots + dottedName);
                }
            },
        },
        tree,
    );

    return modules;
}

export async function resolveModule(
    db: FileStorageDb,
    module: string,
): Promise<FileContents | undefined> {
    const modulePath = module.replace(/\./g, '/') + '.py';

    return await db.transaction('r', db.metadata, db._contents, async () => {
        const match = await db.metadata.where('path').equals(modulePath).first();

        if (!match) {
            return undefined;
        }

        const file = await db._contents.get(match.path);

        return file;
    });
}
