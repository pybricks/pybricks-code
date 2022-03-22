// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import * as browserFsAccess from 'browser-fs-access';
import { FileWithHandle } from 'browser-fs-access';
import { mock } from 'jest-mock-extended';
import { AsyncSaga } from '../../test';
import {
    fileStorageDidFailToRenameFile,
    fileStorageDidRenameFile,
    fileStorageRenameFile,
    fileStorageWriteFile,
} from '../fileStorage/actions';
import { pythonFileExtension } from '../pybricksMicropython/lib';
import {
    Hub,
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

        const action = await saga.take();
        expect(action).toEqual(fileStorageWriteFile(testFileName, testFileContents));

        const action2 = await saga.take();
        expect(action2).toEqual(explorerDidImportFiles());

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

        const action = await saga.take();
        expect(action).toMatchInlineSnapshot(`
            Object {
              "fileContents": "from pybricks.hubs import TechnicHub
            from pybricks.pupdevices import Motor
            from pybricks.parameters import Button, Color, Direction, Port, Stop
            from pybricks.robotics import DriveBase
            from pybricks.tools import wait, StopWatch

            hub = TechnicHub()

            ",
              "fileName": "test.py",
              "type": "fileStorage.action.writeFile",
            }
        `);

        await saga.end();
    });
});

describe('handleExplorerRenameFile', () => {
    let saga: AsyncSaga;

    beforeEach(async () => {
        saga = new AsyncSaga(explorer);

        saga.put(explorerRenameFile('old.file'));

        const action = await saga.take();
        expect(action).toEqual(renameFileDialogShow('old.file'));
    });

    it('should dispatch action if canceled', async () => {
        saga.put(renameFileDialogDidCancel());

        const action = await saga.take();
        expect(action).toEqual(explorerDidFailToRenameFile());
    });

    describe('should dispatch fileStorage action if accepted', () => {
        beforeEach(async () => {
            saga.put(renameFileDialogDidAccept('old.file', 'new.file'));

            const action = await saga.take();
            expect(action).toEqual(fileStorageRenameFile('old.file', 'new.file'));
        });

        it('should dispatch action on fileStorage failure', async () => {
            saga.put(
                fileStorageDidFailToRenameFile(
                    'old.file',
                    'new.file',
                    new Error('test error'),
                ),
            );

            const action = await saga.take();
            expect(action).toEqual(explorerDidFailToRenameFile());
        });

        it('should dispatch action on fileStorage success', async () => {
            saga.put(fileStorageDidRenameFile('old.file', 'new.file'));

            const action = await saga.take();
            expect(action).toEqual(explorerDidRenameFile());
        });
    });

    afterEach(async () => {
        await saga.end();
    });
});
