// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { fileOpen, fileSave } from 'browser-fs-access';
import JSZip from 'jszip';
import { call, put, race, take, takeEvery } from 'typed-redux-saga/macro';
import { alertsShowAlert } from '../alerts/actions';
import {
    editorActivateFile,
    editorCloseFile,
    editorDidActivateFile,
    editorDidCloseFile,
    editorDidFailToActivateFile,
} from '../editor/actions';
import { EditorError } from '../editor/error';
import { getPybricksMicroPythonFileTemplate } from '../editor/pybricksMicroPython';
import {
    fileStorageCopyFile,
    fileStorageDeleteFile,
    fileStorageDidCopyFile,
    fileStorageDidDeleteFile,
    fileStorageDidDumpAllFiles,
    fileStorageDidFailToCopyFile,
    fileStorageDidFailToDeleteFile,
    fileStorageDidFailToDumpAllFiles,
    fileStorageDidFailToReadFile,
    fileStorageDidFailToRenameFile,
    fileStorageDidFailToWriteFile,
    fileStorageDidReadFile,
    fileStorageDidRenameFile,
    fileStorageDidWriteFile,
    fileStorageDumpAllFiles,
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
import { defined, ensureError, timestamp } from '../utils';
import {
    explorerArchiveAllFiles,
    explorerCreateNewFile,
    explorerDeleteFile,
    explorerDidArchiveAllFiles,
    explorerDidCreateNewFile,
    explorerDidDeleteFile,
    explorerDidDuplicateFile,
    explorerDidExportFile,
    explorerDidFailToArchiveAllFiles,
    explorerDidFailToCreateNewFile,
    explorerDidFailToDeleteFile,
    explorerDidFailToDuplicateFile,
    explorerDidFailToExportFile,
    explorerDidFailToImportFiles,
    explorerDidFailToRenameFile,
    explorerDidImportFiles,
    explorerDidRenameFile,
    explorerDuplicateFile,
    explorerExportFile,
    explorerImportFiles,
    explorerRenameFile,
    explorerUserActivateFile,
    explorerUserDidActivateFile,
} from './actions';
import {
    deleteFileAlertDidAccept,
    deleteFileAlertDidCancel,
    deleteFileAlertShow,
} from './deleteFileAlert/actions';
import {
    duplicateFileDialogDidAccept,
    duplicateFileDialogDidCancel,
    duplicateFileDialogShow,
} from './duplicateFileDialog/actions';
import {
    newFileWizardDidAccept,
    newFileWizardDidCancel,
    newFileWizardShow,
} from './newFileWizard/actions';
import {
    renameFileDialogDidAccept,
    renameFileDialogDidCancel,
    renameFileDialogShow,
} from './renameFileDialog/actions';

function* handleExplorerArchiveAllFiles(): Generator {
    try {
        yield* put(fileStorageDumpAllFiles());

        const { didDump, didFailToDump } = yield* race({
            didDump: take(fileStorageDidDumpAllFiles),
            didFailToDump: take(fileStorageDidFailToDumpAllFiles),
        });

        if (didFailToDump) {
            throw didFailToDump.error;
        }

        defined(didDump);

        if (didDump.files.length === 0) {
            throw new Error('no files');
        }

        const zip = new JSZip();

        for (const f of didDump.files) {
            yield* call(() => zip.file(f.path, f.contents));
        }

        const zipData = yield* call(() => zip.generateAsync({ type: 'blob' }));

        const fileName = `pybricks-backup-${timestamp()}.zip`;

        yield* call(() =>
            fileSave(zipData, {
                id: 'pybricksCodeFileStorageArchive',
                fileName,
                extensions: ['.zip'],
                mimeTypes: ['application/zip'],
                // TODO: translate description
                description: 'Zip Files',
            }),
        );

        yield* put(explorerDidArchiveAllFiles());
    } catch (err) {
        yield* put(explorerDidFailToArchiveAllFiles(ensureError(err)));
    }
}

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

            const result = validateFileName(baseName, pythonFileExtension, []);

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

function* handleExplorerCreateNewFile(): Generator {
    try {
        yield* put(newFileWizardShow());

        const { didAccept, didCancel } = yield* race({
            didAccept: take(newFileWizardDidAccept),
            didCancel: take(newFileWizardDidCancel),
        });

        if (didCancel) {
            throw new DOMException('user canceled', 'AbortError');
        }

        defined(didAccept);

        const fileName = `${didAccept.fileName}${didAccept.fileExtension}`;

        yield* put(
            fileStorageWriteFile(
                fileName,
                getPybricksMicroPythonFileTemplate(didAccept.hubType) || '',
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

        yield* put(editorActivateFile(fileName));

        yield* put(explorerDidCreateNewFile());
    } catch (err) {
        yield* put(explorerDidFailToCreateNewFile(ensureError(err)));
    }
}

/**
 * Connects user triggered action to editor module.
 * @param action
 */
function* handleExplorerActivateFile(
    action: ReturnType<typeof explorerUserActivateFile>,
): Generator {
    yield* put(editorActivateFile(action.fileName));

    const { didFailToActivate } = yield* race({
        didActivate: take(
            editorDidActivateFile.when((a) => a.fileName === action.fileName),
        ),
        didFailToActivate: take(
            editorDidFailToActivateFile.when((a) => a.fileName === action.fileName),
        ),
    });

    if (didFailToActivate) {
        if (
            didFailToActivate.error instanceof EditorError &&
            didFailToActivate.error.name === 'FileInUse'
        ) {
            yield* put(
                alertsShowAlert('explorer', 'fileInUse', { fileName: action.fileName }),
            );
        } else {
            yield* put(
                alertsShowAlert('alerts', 'unexpectedError', {
                    error: didFailToActivate.error,
                }),
            );
        }
    }

    yield* put(explorerUserDidActivateFile(action.fileName));
}

/** Connects user initiate duplicate file actions to the duplicate file dialog. */
function* handleExplorerDuplicateFile(
    action: ReturnType<typeof explorerDuplicateFile>,
): Generator {
    try {
        yield* put(duplicateFileDialogShow(action.fileName));

        const { didAccept, didCancel } = yield* race({
            didAccept: take(duplicateFileDialogDidAccept),
            didCancel: take(duplicateFileDialogDidCancel),
        });

        if (didCancel) {
            throw new DOMException('user canceled', 'AbortError');
        }

        defined(didAccept);

        // REVISIT: if editor is not flushed to storage right away, we would
        // need to check for open editors here

        yield* put(fileStorageCopyFile(action.fileName, didAccept.newName));

        const { didFailToCopy } = yield* race({
            didCopy: take(
                fileStorageDidCopyFile.when((a) => a.path === action.fileName),
            ),
            didFailToCopy: take(
                fileStorageDidFailToCopyFile.when((a) => a.path === action.fileName),
            ),
        });

        if (didFailToCopy) {
            throw didFailToCopy.error;
        }

        yield* put(explorerDidDuplicateFile(action.fileName));
    } catch (err) {
        yield* put(explorerDidFailToDuplicateFile(action.fileName, ensureError(err)));
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

function* handleExplorerDeleteFile(action: ReturnType<typeof explorerDeleteFile>) {
    try {
        yield* put(deleteFileAlertShow(action.fileName));

        const { didCancel } = yield* race({
            didAccept: take(deleteFileAlertDidAccept),
            didCancel: take(deleteFileAlertDidCancel),
        });

        if (didCancel) {
            throw new DOMException('user canceled', 'AbortError');
        }

        // at this point we know the user accepted

        // have to close editor before deleting, otherwise we get "in use" error
        yield* put(editorCloseFile(action.fileName));
        yield* take(editorDidCloseFile.when((a) => a.fileName === action.fileName));

        yield* put(fileStorageDeleteFile(action.fileName));

        const { didFailToDelete } = yield* race({
            didDelete: take(
                fileStorageDidDeleteFile.when((a) => a.path === action.fileName),
            ),
            didFailToDelete: take(
                fileStorageDidFailToDeleteFile.when((a) => a.path === action.fileName),
            ),
        });

        if (didFailToDelete) {
            throw didFailToDelete.error;
        }

        yield* put(explorerDidDeleteFile(action.fileName));
    } catch (err) {
        yield* put(explorerDidFailToDeleteFile(action.fileName, ensureError(err)));
    }
}

export default function* (): Generator {
    yield* takeEvery(explorerArchiveAllFiles, handleExplorerArchiveAllFiles);
    yield* takeEvery(explorerImportFiles, handleExplorerImportFiles);
    yield* takeEvery(explorerCreateNewFile, handleExplorerCreateNewFile);
    yield* takeEvery(explorerUserActivateFile, handleExplorerActivateFile);
    yield* takeEvery(explorerRenameFile, handleExplorerRenameFile);
    yield* takeEvery(explorerDuplicateFile, handleExplorerDuplicateFile);
    yield* takeEvery(explorerExportFile, handleExplorerExportFile);
    yield* takeEvery(explorerDeleteFile, handleExplorerDeleteFile);
}
