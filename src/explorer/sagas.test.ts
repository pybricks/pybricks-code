// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import * as browserFsAccess from 'browser-fs-access';
import { FileWithHandle } from 'browser-fs-access';
import { mock } from 'jest-mock-extended';
import { AsyncSaga } from '../../test';
import {
    fileStorageDidFailToReadFile,
    fileStorageDidFailToRenameFile,
    fileStorageDidReadFile,
    fileStorageDidRenameFile,
    fileStorageDidWriteFile,
    fileStorageReadFile,
    fileStorageRenameFile,
    fileStorageWriteFile,
} from '../fileStorage/actions';
import { pythonFileExtension } from '../pybricksMicropython/lib';
import {
    Hub,
    explorerCreateNewFile,
    explorerDidCreateNewFile,
    explorerDidExportFile,
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
import explorer from './sagas';

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

        saga.put(fileStorageDidWriteFile(testFileName));

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
});

describe('handleExplorerCreateNewFile', () => {
    it('should dispatch fileStorage action', async () => {
        const saga = new AsyncSaga(explorer);

        saga.put(explorerCreateNewFile('test', pythonFileExtension, Hub.Technic));

        await expect(saga.take()).resolves.toMatchInlineSnapshot(`
            Object {
              "contents": "from pybricks.hubs import TechnicHub
            from pybricks.pupdevices import Motor
            from pybricks.parameters import Button, Color, Direction, Port, Stop
            from pybricks.robotics import DriveBase
            from pybricks.tools import wait, StopWatch

            hub = TechnicHub()

            ",
              "path": "test.py",
              "type": "fileStorage.action.writeFile",
            }
        `);

        saga.put(fileStorageDidWriteFile('test.py'));

        await expect(saga.take()).resolves.toEqual(explorerDidCreateNewFile());

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
