// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { fileOpen } from 'browser-fs-access';
import { call, put, select, takeEvery } from 'typed-redux-saga/macro';
import { getPybricksMicroPythonFileTemplate } from '../editor/pybricksMicroPython';
import { fileStorageWriteFile } from '../fileStorage/actions';
import {
    FileNameValidationResult,
    pythonFileExtension,
    pythonFileExtensionRegex,
    pythonFileMimeType,
    validateFileName,
} from '../pybricksMicropython/lib';
import { RootState } from '../reducers';
import { ensureError } from '../utils';
import {
    explorerCreateNewFile,
    explorerDidFailToImportFiles,
    explorerDidImportFiles,
    explorerImportFiles,
} from './actions';

function* handleExplorerImportFiles(): Generator {
    try {
        const selectedFiles = yield* call(() =>
            fileOpen({
                id: 'pybricks-code-explorer-import',
                mimeTypes: [pythonFileMimeType],
                extensions: [pythonFileExtension],
                // TODO: translate description
                description: 'Python Files',
                multiple: true,
                excludeAcceptAllOption: true,
            }),
        );

        for (const file of selectedFiles) {
            // getting the text now to catch possible error *before* user interaction
            const text = yield* call(() => file.text());

            const [baseName] = file.name.split(pythonFileExtensionRegex);
            const existingFiles = yield* select(
                (s: RootState) => s.fileStorage.fileNames,
            );

            const result = validateFileName(
                baseName,
                pythonFileExtension,
                existingFiles,
            );

            if (result != FileNameValidationResult.IsOk) {
                // TODO: validate file name and allow user to rename or skip
                console.error(
                    'skipping file',
                    file.name,
                    FileNameValidationResult[result],
                );
                continue;
            }

            yield* put(fileStorageWriteFile(`${baseName}${pythonFileExtension}`, text));
        }

        yield* put(explorerDidImportFiles());
    } catch (err) {
        yield* put(explorerDidFailToImportFiles(ensureError(err)));
    }
}

function* handleExplorerCreateNewFile(
    action: ReturnType<typeof explorerCreateNewFile>,
): Generator {
    const fileName = `${action.fileName}${action.fileExtension}`;

    yield* put(
        fileStorageWriteFile(
            fileName,
            getPybricksMicroPythonFileTemplate(action.hub) || '',
        ),
    );
}

export default function* (): Generator {
    yield* takeEvery(explorerImportFiles, handleExplorerImportFiles);
    yield* takeEvery(explorerCreateNewFile, handleExplorerCreateNewFile);
}
