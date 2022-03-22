// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { fileOpen } from 'browser-fs-access';
import {
    call,
    put,
    race,
    select,
    take,
    takeEvery,
    takeLatest,
} from 'typed-redux-saga/macro';
import { getPybricksMicroPythonFileTemplate } from '../editor/pybricksMicroPython';
import {
    fileStorageDidFailToRenameFile,
    fileStorageDidRenameFile,
    fileStorageRenameFile,
    fileStorageWriteFile,
} from '../fileStorage/actions';
import {
    FileNameValidationResult,
    pythonFileExtension,
    pythonFileExtensionRegex,
    pythonFileMimeType,
    validateFileName,
} from '../pybricksMicropython/lib';
import { RootState } from '../reducers';
import { defined, ensureError } from '../utils';
import {
    explorerCreateNewFile,
    explorerDidFailToImportFiles,
    explorerDidFailToRenameFile,
    explorerDidImportFiles,
    explorerDidRenameFile,
    explorerImportFiles,
    explorerRenameFile,
} from './actions';
import {
    renameFileDialogDidAccept,
    renameFileDialogDidCancel,
    renameFileDialogShow,
} from './renameFileDialog/actions';

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

/** Connects user initiate rename file actions to the rename file dialog. */
function* handleExplorerRenameFile(
    action: ReturnType<typeof explorerRenameFile>,
): Generator {
    yield* put(renameFileDialogShow(action.fileName));

    const { accepted, canceled } = yield* race({
        accepted: take(renameFileDialogDidAccept),
        canceled: take(renameFileDialogDidCancel),
    });

    if (canceled) {
        yield* put(explorerDidFailToRenameFile());
        return;
    }

    defined(accepted);

    yield* put(fileStorageRenameFile(accepted.oldName, accepted.newName));

    const { failed } = yield* race({
        succeeded: take(
            fileStorageDidRenameFile.when(
                (a) => a.oldName === accepted.oldName && a.newName === accepted.newName,
            ),
        ),
        failed: take(
            fileStorageDidFailToRenameFile.when(
                (a) => a.oldName === accepted.oldName && a.newName === accepted.newName,
            ),
        ),
    });

    if (failed) {
        yield* put(explorerDidFailToRenameFile());
        return;
    }

    yield* put(explorerDidRenameFile());
}

export default function* (): Generator {
    yield* takeEvery(explorerImportFiles, handleExplorerImportFiles);
    yield* takeEvery(explorerCreateNewFile, handleExplorerCreateNewFile);
    // takeLatest should ensure that if we trigger a new rename before the
    // previous one is finished, the old one will be canceled. We don't expect
    // this to happen in practice though.
    yield* takeLatest(explorerRenameFile, handleExplorerRenameFile);
}
