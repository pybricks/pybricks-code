// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { fileOpen, fileSave } from 'browser-fs-access';
import JSZip from 'jszip';
import { call, put, race, select, take, takeEvery } from 'typed-redux-saga/macro';
import {
    editorActivateFile,
    editorCloseFile,
    editorDidActivateFile,
    editorDidCloseFile,
    editorDidFailToActivateFile,
} from '../editor/actions';
import { getPybricksMicroPythonFileTemplate } from '../editor/pybricksMicroPython';
import {
    fileStorageDeleteFile,
    fileStorageDidDeleteFile,
    fileStorageDidDumpAllFiles,
    fileStorageDidFailToDeleteFile,
    fileStorageDidFailToDumpAllFiles,
    fileStorageDidFailToReadFile,
    fileStorageDidFailToWriteFile,
    fileStorageDidReadFile,
    fileStorageDidRemoveItem,
    fileStorageDidWriteFile,
    fileStorageDumpAllFiles,
    fileStorageReadFile,
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
    explorerActivateFile,
    explorerArchiveAllFiles,
    explorerCreateNewFile,
    explorerDeleteFile,
    explorerDidActivateFile,
    explorerDidArchiveAllFiles,
    explorerDidCreateNewFile,
    explorerDidDeleteFile,
    explorerDidExportFile,
    explorerDidFailToActivateFile,
    explorerDidFailToArchiveAllFiles,
    explorerDidFailToCreateNewFile,
    explorerDidFailToDeleteFile,
    explorerDidFailToExportFile,
    explorerDidFailToImportFiles,
    explorerDidImportFiles,
    explorerExportFile,
    explorerImportFiles,
} from './actions';
import {
    deleteFileAlertDidAccept,
    deleteFileAlertDidCancel,
    deleteFileAlertShow,
} from './deleteFileAlert/actions';
import {
    newFileWizardDidAccept,
    newFileWizardDidCancel,
    newFileWizardShow,
} from './newFileWizard/actions';

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
            const existingFiles = yield* select((s: RootState) => s.explorer.files);

            const result = validateFileName(
                baseName,
                pythonFileExtension,
                existingFiles.map((f) => f.name),
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
    action: ReturnType<typeof explorerActivateFile>,
): Generator {
    yield* put(editorActivateFile(action.fileName));

    const { didActivate, didFailToActivate } = yield* race({
        didActivate: take(
            editorDidActivateFile.when((a) => a.fileName === action.fileName),
        ),
        didFailToActivate: take(
            editorDidFailToActivateFile.when((a) => a.fileName === action.fileName),
        ),
    });

    if (didFailToActivate) {
        yield* put(
            explorerDidFailToActivateFile(
                didFailToActivate.fileName,
                didFailToActivate.error,
            ),
        );
        return;
    }

    defined(didActivate);

    yield* put(explorerDidActivateFile(didActivate.fileName));
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

        const { didCancel, didRemove } = yield* race({
            didAccept: take(deleteFileAlertDidAccept),
            didCancel: take(deleteFileAlertDidCancel),
            didRemove: take(
                fileStorageDidRemoveItem.when((a) => a.file.path === action.fileName),
            ),
        });

        if (didCancel) {
            throw new DOMException('user canceled', 'AbortError');
        }

        // automatically cancel the dialog, if the file was removed, e.g. it was
        // deleted in a different window
        if (didRemove) {
            yield* put(deleteFileAlertDidCancel());
            throw new DOMException('file was removed', 'AbortError');
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
    yield* takeEvery(explorerActivateFile, handleExplorerActivateFile);
    yield* takeEvery(explorerExportFile, handleExplorerExportFile);
    yield* takeEvery(explorerDeleteFile, handleExplorerDeleteFile);
}
