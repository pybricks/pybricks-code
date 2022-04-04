// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { fileOpen, fileSave } from 'browser-fs-access';
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
    fileStorageDidFailToReadFile,
    fileStorageDidFailToRenameFile,
    fileStorageDidFailToWriteFile,
    fileStorageDidReadFile,
    fileStorageDidRenameFile,
    fileStorageDidWriteFile,
    fileStorageReadFile,
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
    explorerDidCreateNewFile,
    explorerDidExportFile,
    explorerDidFailToCreateNewFile,
    explorerDidFailToExportFile,
    explorerDidFailToImportFiles,
    explorerDidFailToRenameFile,
    explorerDidImportFiles,
    explorerDidRenameFile,
    explorerExportFile,
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
            const existingFiles = yield* select((s: RootState) => s.fileStorage.files);

            const result = validateFileName(
                baseName,
                pythonFileExtension,
                existingFiles.map((f) => f.path),
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

            const fileName = `${baseName}${pythonFileExtension}`;

            yield* put(fileStorageWriteFile(fileName, text));

            const { didFailToWrite } = yield* race({
                didWrite: take(
                    fileStorageDidWriteFile.when((a) => a.path === fileName),
                ),
                didFailToWrite: take(
                    fileStorageDidFailToWriteFile.when((a) => a.path === fileName),
                ),
            });

            if (didFailToWrite) {
                throw didFailToWrite.error;
            }
        }

        yield* put(explorerDidImportFiles());
    } catch (err) {
        yield* put(explorerDidFailToImportFiles(ensureError(err)));
    }
}

function* handleExplorerCreateNewFile(
    action: ReturnType<typeof explorerCreateNewFile>,
): Generator {
    try {
        const fileName = `${action.fileName}${action.fileExtension}`;

        yield* put(
            fileStorageWriteFile(
                fileName,
                getPybricksMicroPythonFileTemplate(action.hub) || '',
            ),
        );

        const { didFailToWrite } = yield* race({
            didWrite: take(fileStorageDidWriteFile.when((a) => a.path === fileName)),
            didFailToWrite: take(
                fileStorageDidFailToWriteFile.when((a) => a.path === fileName),
            ),
        });

        if (didFailToWrite) {
            throw didFailToWrite.error;
        }

        yield* put(explorerDidCreateNewFile());
    } catch (err) {
        yield* put(explorerDidFailToCreateNewFile(ensureError(err)));
    }
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

    yield* put(fileStorageRenameFile(action.fileName, accepted.newName));

    const didRename = yield* race({
        succeeded: take(
            fileStorageDidRenameFile.when((a) => a.fileName === action.fileName),
        ),
        failed: take(
            fileStorageDidFailToRenameFile.when((a) => a.fileName === action.fileName),
        ),
    });

    if (didRename.failed) {
        yield* put(explorerDidFailToRenameFile());
        return;
    }

    yield* put(explorerDidRenameFile());
}

function* handleExplorerExportFile(
    action: ReturnType<typeof explorerExportFile>,
): Generator {
    try {
        yield* put(fileStorageReadFile(action.fileName));

        const { didRead, didFailToRead } = yield* race({
            didRead: take(
                fileStorageDidReadFile.when((a) => a.path === action.fileName),
            ),
            didFailToRead: take(
                fileStorageDidFailToReadFile.when((a) => a.path === action.fileName),
            ),
        });

        if (didFailToRead) {
            throw didFailToRead.error;
        }

        defined(didRead);

        const blob = new Blob([didRead.contents], { type: `${pythonFileMimeType}` });

        yield* call(() =>
            fileSave(blob, {
                id: 'pybricksCodeFileStorageExport',
                fileName: action.fileName,
                extensions: [pythonFileExtension],
                mimeTypes: [pythonFileMimeType],
                // TODO: translate description
                description: 'Python Files',
            }),
        );

        yield* put(explorerDidExportFile(action.fileName));
    } catch (err) {
        yield* put(explorerDidFailToExportFile(action.fileName, ensureError(err)));
    }
}

export default function* (): Generator {
    yield* takeEvery(explorerImportFiles, handleExplorerImportFiles);
    yield* takeEvery(explorerCreateNewFile, handleExplorerCreateNewFile);
    // takeLatest should ensure that if we trigger a new rename before the
    // previous one is finished, the old one will be canceled. We don't expect
    // this to happen in practice though.
    yield* takeLatest(explorerRenameFile, handleExplorerRenameFile);
    yield* takeLatest(explorerExportFile, handleExplorerExportFile);
}
