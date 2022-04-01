// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import * as browserFsAccess from 'browser-fs-access';
import { FileWithHandle } from 'browser-fs-access';
import { mock } from 'jest-mock-extended';
import { AsyncSaga, uuid } from '../../test';
import {
    fileStorageDidFailToRenameFile,
    fileStorageDidOpenFile,
    fileStorageDidRenameFile,
    fileStorageDidWriteFile,
    fileStorageOpenFile,
    fileStorageRenameFile,
    fileStorageWriteFile,
} from '../fileStorage/actions';
import { pythonFileExtension } from '../pybricksMicropython/lib';
import {
    Hub,
    explorerCreateNewFile,
    explorerDidCreateNewFile,
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

        await expect(saga.take()).resolves.toEqual(fileStorageOpenFile(testFileName));

        saga.put(fileStorageDidOpenFile(testFileName, uuid(0)));

        await expect(saga.take()).resolves.toEqual(
            fileStorageWriteFile(uuid(0), testFileContents),
        );

        saga.put(fileStorageDidWriteFile(uuid(0)));

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

        await expect(saga.take()).resolves.toEqual(fileStorageOpenFile('test.py'));

        saga.put(fileStorageDidOpenFile('test.py', uuid(0)));

        await expect(saga.take()).resolves.toMatchInlineSnapshot(`
            Object {
              "contents": "from pybricks.hubs import TechnicHub
            from pybricks.pupdevices import Motor
            from pybricks.parameters import Button, Color, Direction, Port, Stop
            from pybricks.robotics import DriveBase
            from pybricks.tools import wait, StopWatch

            hub = TechnicHub()

            ",
              "id": "00000000-0000-0000-0000-000000000000",
              "type": "fileStorage.action.writeFile",
            }
        `);

        saga.put(fileStorageDidWriteFile(uuid(0)));

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
