// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import * as browserFsAccess from 'browser-fs-access';
import { FileWithHandle } from 'browser-fs-access';
import { mock } from 'jest-mock-extended';
import { AsyncSaga, uuid } from '../../test';
import { alertsShowAlert } from '../alerts/actions';
import { Hub } from '../components/hubPicker';
import {
    editorActivateFile,
    editorCloseFile,
    editorDidActivateFile,
    editorDidCloseFile,
    editorDidFailToActivateFile,
} from '../editor/actions';
import { EditorError } from '../editor/error';
import { UUID } from '../fileStorage';
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
    fileStorageDidReadFile,
    fileStorageDidRenameFile,
    fileStorageDidWriteFile,
    fileStorageDumpAllFiles,
    fileStorageReadFile,
    fileStorageRenameFile,
    fileStorageWriteFile,
} from '../fileStorage/actions';
import { pythonFileExtension } from '../pybricksMicropython/lib';
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
import { ExplorerError, ExplorerErrorName } from './error';
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
    renameImportDialogShow,
} from './renameImportDialog/actions';
import explorer from './sagas';

jest.mock('browser-fs-access');

/**
 * Asymmetric matcher for matching errors by name while ignoring the message.
 * @param name The name to match.
 * @returns An asymmetric matcher cast to an ExplorerError so that it can be
 * passed to action functions.
 */
function expectExplorerError(name: ExplorerErrorName): ExplorerError {
    const matcher: jest.AsymmetricMatcher & Record<string, unknown> = {
        $$typeof: Symbol.for('jest.asymmetricMatcher'),
        asymmetricMatch: (other) =>
            other instanceof ExplorerError && other.name === name,
        toAsymmetricMatcher: () => `[ExplorerError: ${name}]`,
    };

    return matcher as unknown as ExplorerError;
}

describe('handleExplorerArchiveAllFiles', () => {
    let saga: AsyncSaga;

    beforeEach(async () => {
        saga = new AsyncSaga(explorer);
    });

    describe('should call into fileStorage', () => {
        beforeEach(async () => {
            saga.put(explorerArchiveAllFiles());

            await expect(saga.take()).resolves.toEqual(fileStorageDumpAllFiles());
        });

        it('should propagate error when fileStorage fails', async () => {
            const testError = new Error('test error');

            saga.put(fileStorageDidFailToDumpAllFiles(testError));

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );

            await expect(saga.take()).resolves.toEqual(
                explorerDidFailToArchiveAllFiles(testError),
            );
        });

        it('should fail if there are no files in storage', async () => {
            saga.put(fileStorageDidDumpAllFiles([]));

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('explorer', 'noFilesToBackup'),
            );

            await expect(saga.take()).resolves.toEqual(
                explorerDidFailToArchiveAllFiles(expectExplorerError('NoFiles')),
            );
        });

        describe('should continue when fileStorage succeeds', () => {
            beforeEach(async () => {
                saga.put(
                    fileStorageDidDumpAllFiles([
                        { path: 'test.file', contents: 'test file contents' },
                    ]),
                );
            });

            it('should catch error', async () => {
                const testError = new Error('test error');

                jest.spyOn(browserFsAccess, 'fileSave').mockImplementation(() => {
                    throw testError;
                });

                await expect(saga.take()).resolves.toEqual(
                    alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
                );

                await expect(saga.take()).resolves.toEqual(
                    explorerDidFailToArchiveAllFiles(testError),
                );
            });

            it('should archive file', async () => {
                jest.spyOn(browserFsAccess, 'fileSave');

                await expect(saga.take()).resolves.toEqual(
                    explorerDidArchiveAllFiles(),
                );

                expect(browserFsAccess.fileSave).toHaveBeenCalled();
            });
        });
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('handleExplorerImportFiles', () => {
    it('should write file to storage', async () => {
        const testFileName = 'test.py';
        const testFileContents = '# test';

        const saga = new AsyncSaga(explorer);

        jest.spyOn(browserFsAccess, 'fileOpen').mockResolvedValueOnce([
            mock<FileWithHandle>({
                name: testFileName,
                text: () => Promise.resolve(testFileContents),
            }),
        ]);

        saga.put(explorerImportFiles());

        await expect(saga.take()).resolves.toEqual(
            fileStorageWriteFile(testFileName, testFileContents),
        );

        saga.put(fileStorageDidWriteFile(testFileName, uuid(0)));

        await expect(saga.take()).resolves.toEqual(explorerDidImportFiles());

        await saga.end();
    });

    it('should handle user cancellation', async () => {
        const cancelError = new DOMException('test message', 'AbortError');

        const saga = new AsyncSaga(explorer);

        jest.spyOn(browserFsAccess, 'fileOpen').mockRejectedValueOnce(cancelError);

        saga.put(explorerImportFiles());

        const action = await saga.take();
        expect(action).toEqual(explorerDidFailToImportFiles(cancelError));

        await saga.end();
    });

    it('should handle invalid file name', async () => {
        const testFileName = 'bad#name.py';
        const testFileContents = '# test';

        const saga = new AsyncSaga(explorer);

        jest.spyOn(browserFsAccess, 'fileOpen').mockResolvedValueOnce([
            mock<FileWithHandle>({
                name: testFileName,
                text: () => Promise.resolve(testFileContents),
            }),
        ]);

        saga.put(explorerImportFiles());

        await expect(saga.take()).resolves.toEqual(
            renameImportDialogShow(testFileName),
        );

        const renamedFileName = 'good_name.py';

        saga.put(renameImportDialogDidAccept(testFileName, renamedFileName));

        await expect(saga.take()).resolves.toEqual(
            fileStorageWriteFile(renamedFileName, testFileContents),
        );

        saga.put(fileStorageDidWriteFile(renamedFileName, uuid(0)));

        await expect(saga.take()).resolves.toEqual(explorerDidImportFiles());

        await saga.end();
    });
});

describe('handleExplorerCreateNewFile', () => {
    let saga: AsyncSaga;

    beforeEach(async () => {
        saga = new AsyncSaga(explorer);

        saga.put(explorerCreateNewFile());

        await expect(saga.take()).resolves.toEqual(newFileWizardShow());
    });

    it('should dispatch error when canceled', async () => {
        saga.put(newFileWizardDidCancel());

        await expect(saga.take()).resolves.toEqual(
            explorerDidFailToCreateNewFile(
                new DOMException('user canceled', 'AbortError'),
            ),
        );
    });

    it('should dispatch fileStorage action', async () => {
        saga.put(newFileWizardDidAccept('test', pythonFileExtension, Hub.Technic));

        await expect(saga.take()).resolves.toMatchInlineSnapshot(`
            {
              "contents": "from pybricks.hubs import TechnicHub
            from pybricks.pupdevices import Motor
            from pybricks.parameters import Button, Color, Direction, Port, Side, Stop
            from pybricks.robotics import DriveBase
            from pybricks.tools import wait, StopWatch

            hub = TechnicHub()

            ",
              "path": "test.py",
              "type": "fileStorage.action.writeFile",
            }
        `);

        saga.put(fileStorageDidWriteFile('test.py', uuid(0)));

        await expect(saga.take()).resolves.toEqual(editorActivateFile(uuid(0)));

        await expect(saga.take()).resolves.toEqual(explorerDidCreateNewFile());
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('handleExplorerActivateFile', () => {
    let saga: AsyncSaga;

    beforeEach(async () => {
        saga = new AsyncSaga(explorer);

        saga.put(explorerUserActivateFile('test.file', uuid(0)));

        await expect(saga.take()).resolves.toEqual(editorActivateFile(uuid(0)));
    });

    it('should alert file in use error', async () => {
        const testError = new EditorError('FileInUse', 'test error');
        saga.put(editorDidFailToActivateFile(uuid(0), testError));

        await expect(saga.take()).resolves.toEqual(
            alertsShowAlert('explorer', 'fileInUse', { fileName: 'test.file' }),
        );
        await expect(saga.take()).resolves.toEqual(
            explorerUserDidActivateFile('test.file'),
        );
    });

    it('should alert unexpected error', async () => {
        const testError = new Error('test error');
        saga.put(editorDidFailToActivateFile(uuid(0), testError));

        await expect(saga.take()).resolves.toEqual(
            alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
        );
        await expect(saga.take()).resolves.toEqual(
            explorerUserDidActivateFile('test.file'),
        );
    });

    it('should notify success', async () => {
        saga.put(editorDidActivateFile(uuid(0)));

        await expect(saga.take()).resolves.toEqual(
            explorerUserDidActivateFile('test.file'),
        );
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('handleExplorerRenameFile', () => {
    let saga: AsyncSaga;

    beforeEach(async () => {
        saga = new AsyncSaga(explorer);

        saga.put(explorerRenameFile('old.file'));

        await expect(saga.take()).resolves.toEqual(renameFileDialogShow('old.file'));
    });

    it('should dispatch action if canceled', async () => {
        saga.put(renameFileDialogDidCancel());

        await expect(saga.take()).resolves.toEqual(explorerDidFailToRenameFile());
    });

    describe('should dispatch fileStorageOpenFile action if accepted', () => {
        beforeEach(async () => {
            saga.put(renameFileDialogDidAccept('old.file', 'new.file'));

            await expect(saga.take()).resolves.toEqual(
                fileStorageRenameFile('old.file', 'new.file'),
            );
        });

        it('should dispatch action on fileStorageRenameFile failure', async () => {
            saga.put(
                fileStorageDidFailToRenameFile('old.file', new Error('test error')),
            );

            await expect(saga.take()).resolves.toEqual(explorerDidFailToRenameFile());
        });

        it('should dispatch action on fileStorageRenameFile success', async () => {
            saga.put(fileStorageDidRenameFile('old.file'));

            await expect(saga.take()).resolves.toEqual(explorerDidRenameFile());
        });
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('handleExplorerDuplicateFile', () => {
    let saga: AsyncSaga;

    beforeEach(async () => {
        saga = new AsyncSaga(explorer);

        saga.put(explorerDuplicateFile('old.file'));

        await expect(saga.take()).resolves.toEqual(duplicateFileDialogShow('old.file'));
    });

    it('should dispatch action if canceled', async () => {
        saga.put(duplicateFileDialogDidCancel());

        await expect(saga.take()).resolves.toEqual(
            explorerDidFailToDuplicateFile(
                'old.file',
                new DOMException('user canceled', 'AbortError'),
            ),
        );
    });

    describe('user accepted', () => {
        beforeEach(async () => {
            saga.put(duplicateFileDialogDidAccept('old.file', 'new.file'));

            await expect(saga.take()).resolves.toEqual(
                fileStorageCopyFile('old.file', 'new.file'),
            );
        });

        it('should propagate failure', async () => {
            const testError = new Error('test error');

            saga.put(fileStorageDidFailToCopyFile('old.file', testError));

            await expect(saga.take()).resolves.toEqual(
                explorerDidFailToDuplicateFile('old.file', testError),
            );
        });

        it('should dispatch action on fileStorageDuplicateFile success', async () => {
            saga.put(fileStorageDidCopyFile('old.file'));

            await expect(saga.take()).resolves.toEqual(
                explorerDidDuplicateFile('old.file'),
            );
        });
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('handleExplorerExportFile', () => {
    let saga: AsyncSaga;
    const testFile = 'test.file';
    const testFileContents = '# test file contents';
    const testError = new Error('test error');

    beforeEach(async () => {
        saga = new AsyncSaga(explorer);

        saga.put(explorerExportFile(testFile));

        await expect(saga.take()).resolves.toEqual(fileStorageReadFile(testFile));
    });

    it('should fail if file does not exist', async () => {
        saga.put(fileStorageDidFailToReadFile(testFile, testError));

        await expect(saga.take()).resolves.toEqual(
            explorerDidFailToExportFile(testFile, testError),
        );
    });

    describe('should read file', () => {
        it('should export file', async () => {
            // NB: resolved value doesn't matter since it is not used
            jest.spyOn(browserFsAccess, 'fileSave').mockResolvedValue(null);

            saga.put(fileStorageDidReadFile(testFile, testFileContents));

            await expect(saga.take()).resolves.toEqual(explorerDidExportFile(testFile));

            expect(browserFsAccess.fileSave).toHaveBeenCalled();
        });

        it('should catch error', async () => {
            jest.spyOn(browserFsAccess, 'fileSave').mockRejectedValue(testError);

            saga.put(fileStorageDidReadFile(testFile, testFileContents));

            await expect(saga.take()).resolves.toEqual(
                explorerDidFailToExportFile(testFile, testError),
            );
        });
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('handleExplorerDeleteFile', () => {
    let saga: AsyncSaga;
    const testFile = 'test.file';

    beforeEach(async () => {
        saga = new AsyncSaga(explorer);

        saga.put(explorerDeleteFile(testFile, uuid(0)));

        await expect(saga.take()).resolves.toEqual(deleteFileAlertShow(testFile));
    });

    it('should fail with AbortError if canceled', async () => {
        saga.put(deleteFileAlertDidCancel());

        await expect(saga.take()).resolves.toEqual(
            explorerDidFailToDeleteFile(
                testFile,
                new DOMException('user canceled', 'AbortError'),
            ),
        );
    });

    describe.each([false, true])(
        'accepted, file is open: %o',
        (fileIsOpenInEditor: boolean) => {
            beforeEach(async () => {
                if (fileIsOpenInEditor) {
                    const openFileUuids: readonly UUID[] = [uuid(0)];
                    saga.updateState({ editor: { openFileUuids } });
                }

                saga.put(deleteFileAlertDidAccept());

                if (fileIsOpenInEditor) {
                    // should close the editor first
                    await expect(saga.take()).resolves.toEqual(
                        editorCloseFile(uuid(0)),
                    );
                    saga.put(editorDidCloseFile(uuid(0)));
                }

                // then delete the file
                await expect(saga.take()).resolves.toEqual(
                    fileStorageDeleteFile(testFile),
                );
            });

            it('should propagate error', async () => {
                const testError = new Error('test error');
                saga.put(fileStorageDidFailToDeleteFile(testFile, testError));
                await expect(saga.take()).resolves.toEqual(
                    explorerDidFailToDeleteFile(testFile, testError),
                );
            });

            it('should succeed', async () => {
                saga.put(fileStorageDidDeleteFile(testFile));
                await expect(saga.take()).resolves.toEqual(
                    explorerDidDeleteFile(testFile),
                );
            });
        },
    );

    afterEach(async () => {
        await saga.end();
    });
});
