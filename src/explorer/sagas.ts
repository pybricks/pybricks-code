// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { fileOpen, fileSave } from 'browser-fs-access';
import JSZip from 'jszip';
import {
    call,
    getContext,
    put,
    race,
    select,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import { alertsShowAlert } from '../alerts/actions';
import { zipFileExtension, zipFileMimeType } from '../app/constants';
import {
    editorActivateFile,
    editorCloseFile,
    editorDidActivateFile,
    editorDidCloseFile,
    editorDidFailToActivateFile,
    editorReplaceFile,
} from '../editor/actions';
import { EditorError } from '../editor/error';
import { getPybricksMicroPythonFileTemplate } from '../editor/pybricksMicroPython';
import { FileStorageDb } from '../fileStorage';
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
import { RootState } from '../reducers';
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
import { ExplorerError } from './error';
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
import {
    renameImportDialogDidAccept,
    renameImportDialogDidCancel,
    renameImportDialogShow,
} from './renameImportDialog/actions';
import {
    ReplaceImportDialogAction,
    replaceImportDialogDidAccept,
    replaceImportDialogDidCancel,
    replaceImportDialogShow,
} from './replaceImportDialog/actions';

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
            throw new ExplorerError('NoFiles', 'no files in storage');
        }

        const zip = new JSZip();

        for (const f of didDump.files) {
            yield* call(() => zip.file(f.path, f.contents));
        }

        const zipData = yield* call(() => zip.generateAsync({ type: 'blob' }));

        const fileName = `pybricks-backup-${timestamp()}${zipFileExtension}`;

        yield* call(() =>
            fileSave(zipData, {
                id: 'pybricksCodeFileStorageArchive',
                fileName,
                extensions: [zipFileExtension],
                mimeTypes: [zipFileMimeType],
                // TODO: translate description
                description: 'Zip Files',
            }),
        );

        yield* put(explorerDidArchiveAllFiles());
    } catch (err) {
        const error = ensureError(err);

        if (error instanceof DOMException && error.name === 'AbortError') {
            // user canceled, don't show error message
        } else if (error instanceof ExplorerError && error.name === 'NoFiles') {
            yield* put(alertsShowAlert('explorer', 'noFilesToBackup'));
        } else {
            yield* put(
                alertsShowAlert('alerts', 'unexpectedError', {
                    error,
                }),
            );
        }
        yield* put(explorerDidFailToArchiveAllFiles(error));
    }
}

type ImportContext = {
    rememberedAction?: ReplaceImportDialogAction;
};

function* importPythonFile(
    sourceFileName: string,
    sourceFileContents: string,
    context: ImportContext,
): Generator {
    const [baseName] = sourceFileName.split(pythonFileExtensionRegex);
    let fileName = `${baseName}${pythonFileExtension}`;

    const db = yield* getContext<FileStorageDb>('fileStorage');
    const existingFiles = yield* call(() => db.metadata.toArray());

    const result = validateFileName(
        baseName,
        pythonFileExtension,
        existingFiles.map((f) => f.path),
    );

    let replace = false;

    if (result === FileNameValidationResult.AlreadyExists) {
        let action = context.rememberedAction;

        if (action === undefined) {
            yield* put(replaceImportDialogShow(sourceFileName));

            const { accepted, cancelled } = yield* race({
                accepted: take(replaceImportDialogDidAccept),
                cancelled: take(replaceImportDialogDidCancel),
            });

            if (cancelled) {
                return;
            }

            defined(accepted);

            if (accepted.remember) {
                context.rememberedAction = accepted.action;
            }

            action = accepted.action;
        }

        if (action === ReplaceImportDialogAction.Skip) {
            return;
        }

        if (action === ReplaceImportDialogAction.Replace) {
            replace = true;
        }
    }

    if (result !== FileNameValidationResult.IsOk && !replace) {
        yield* put(renameImportDialogShow(sourceFileName));

        const { accepted, cancelled } = yield* race({
            accepted: take(renameImportDialogDidAccept),
            cancelled: take(renameImportDialogDidCancel),
        });

        if (cancelled) {
            return;
        }

        defined(accepted);

        fileName = accepted.newName;
    }

    const existingFileInfo = existingFiles.find((x) => x.path === fileName);
    const openFileUuids = yield* select((s: RootState) => s.editor.openFileUuids);

    // If the file is open, modify contents in the editor so preserve undo
    // history, otherwise write directly to storage.
    if (existingFileInfo && openFileUuids.includes(existingFileInfo.uuid)) {
        yield* put(editorReplaceFile(existingFileInfo.uuid, sourceFileContents));
    } else {
        yield* put(fileStorageWriteFile(fileName, sourceFileContents));

        const { didFailToWrite } = yield* race({
            didWrite: take(fileStorageDidWriteFile.when((a) => a.path === fileName)),
            didFailToWrite: take(
                fileStorageDidFailToWriteFile.when((a) => a.path === fileName),
            ),
        });

        if (didFailToWrite) {
            throw didFailToWrite.error;
        }
    }
}

function* handleExplorerImportFiles(): Generator {
    try {
        const selectedFiles = yield* call(() =>
            fileOpen([
                {
                    id: 'pybricks-code-explorer-import',
                    mimeTypes: [pythonFileMimeType],
                    extensions: [pythonFileExtension],
                    // TODO: translate description
                    description: 'Python Files',
                    multiple: true,
                    excludeAcceptAllOption: true,
                },
                {
                    mimeTypes: [zipFileMimeType],
                    extensions: [zipFileExtension],
                    // TODO: translate description
                    description: 'ZIP Files',
                },
            ]),
        );

        const context: ImportContext = {};

        for (const file of selectedFiles) {
            switch (file.type) {
                case '': // empty string means "could not be determined"
                case pythonFileMimeType:
                    {
                        // getting the text now to catch possible error *before* user interaction
                        const text = yield* call(() => file.text());
                        yield* importPythonFile(file.name, text, context);
                    }
                    break;
                case zipFileMimeType:
                    {
                        const zip = yield* call(() =>
                            JSZip.loadAsync(file.arrayBuffer()),
                        );

                        const zipFiles = zip.filter((_, f) =>
                            f.name.endsWith(pythonFileExtension),
                        );

                        if (zipFiles.length === 0) {
                            yield* put(alertsShowAlert('explorer', 'noPyFiles'));
                            break;
                        }

                        for (const zipFile of zipFiles) {
                            const text = yield* call(() => zipFile.async('text'));
                            yield* importPythonFile(zipFile.name, text, context);
                        }
                    }
                    break;
                default:
                    throw new Error(
                        `'${file.name}' has unsupported file type: ${file.type}`,
                    );
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

        const { didWrite, didFailToWrite } = yield* race({
            didWrite: take(fileStorageDidWriteFile.when((a) => a.path === fileName)),
            didFailToWrite: take(
                fileStorageDidFailToWriteFile.when((a) => a.path === fileName),
            ),
        });

        if (didFailToWrite) {
            throw didFailToWrite.error;
        }

        defined(didWrite);

        yield* put(editorActivateFile(didWrite.uuid));

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
    yield* put(editorActivateFile(action.uuid));

    const { didFailToActivate } = yield* race({
        didActivate: take(editorDidActivateFile.when((a) => a.uuid === action.uuid)),
        didFailToActivate: take(
            editorDidFailToActivateFile.when((a) => a.uuid === action.uuid),
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

        const openUuids = yield* select((s: RootState) => s.editor.openFileUuids);

        // have to close editor before deleting, otherwise we get "in use" error
        if (openUuids.includes(action.uuid)) {
            yield* put(editorCloseFile(action.uuid));
            yield* take(editorDidCloseFile.when((a) => a.uuid === action.uuid));
        }

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
