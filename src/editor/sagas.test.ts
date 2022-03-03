// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import FileSaver from 'file-saver';
import { mock } from 'jest-mock-extended';
import { monaco } from 'react-monaco-editor';
import { AsyncSaga } from '../../test';
import { didFailToSaveAs, didSaveAs, open, saveAs } from './actions';
import editor from './sagas';

jest.mock('react-monaco-editor');
jest.mock('file-saver');

test('open', async () => {
    const mockEditor = mock<monaco.editor.ICodeEditor>();
    const saga = new AsyncSaga(editor, {}, { editor: mockEditor });

    const data = new Uint8Array().buffer;
    saga.put(open(data));

    expect(mockEditor.setValue).toBeCalled();

    await saga.end();
});

describe('saveAs', () => {
    test('web file system api can succeed', async () => {
        const mockEditor = mock<monaco.editor.ICodeEditor>();
        const saga = new AsyncSaga(editor, {}, { editor: mockEditor });

        // window.showSaveFilePicker is not defined in the test environment
        // so we can't use spyOn().
        const mockWriteable = mock<FileSystemWritableFileStream>();
        const originalShowSaveFilePicker = window.showSaveFilePicker;
        window.showSaveFilePicker = jest.fn().mockResolvedValue(
            mock<FileSystemFileHandle>({
                createWritable: jest.fn().mockResolvedValue(mockWriteable),
            }),
        );

        saga.put(saveAs());

        expect(mockEditor.getValue).toHaveBeenCalled();

        const action = await saga.take();
        expect(action).toEqual(didSaveAs());
        expect(window.showSaveFilePicker).toHaveBeenCalled();
        expect(mockWriteable.write).toHaveBeenCalled();
        expect(mockWriteable.close).toHaveBeenCalled();

        await saga.end();

        window.showSaveFilePicker = originalShowSaveFilePicker;
    });

    test('web file system api can fail', async () => {
        const mockEditor = mock<monaco.editor.ICodeEditor>();
        const saga = new AsyncSaga(editor, {}, { editor: mockEditor });

        // window.showSaveFilePicker is not defined in the test environment
        // so we can't use spyOn().
        const testError = new Error('test error');
        const originalShowSaveFilePicker = window.showSaveFilePicker;
        window.showSaveFilePicker = jest.fn().mockResolvedValue(
            mock<FileSystemFileHandle>({
                createWritable: jest.fn().mockRejectedValue(testError),
            }),
        );

        saga.put(saveAs());

        expect(mockEditor.getValue).toHaveBeenCalled();

        const action = await saga.take();
        expect(action).toEqual(didFailToSaveAs(testError));
        expect(window.showSaveFilePicker).toHaveBeenCalled();

        await saga.end();

        window.showSaveFilePicker = originalShowSaveFilePicker;
    });

    test('fallback can succeed', async () => {
        const mockEditor = mock<monaco.editor.ICodeEditor>();
        const saga = new AsyncSaga(editor, {}, { editor: mockEditor });

        const mockFileSaverSaveAs = jest.spyOn(FileSaver, 'saveAs');

        saga.put(saveAs());

        expect(mockEditor.getValue).toHaveBeenCalled();

        const action = await saga.take();
        expect(action).toEqual(didSaveAs());
        expect(mockFileSaverSaveAs).toHaveBeenCalled();

        await saga.end();

        mockFileSaverSaveAs.mockRestore();
    });

    test('fallback can fail', async () => {
        const mockEditor = mock<monaco.editor.ICodeEditor>();
        const saga = new AsyncSaga(editor, {}, { editor: mockEditor });

        const testError = new Error('test error');
        const mockFileSaverSaveAs = jest
            .spyOn(FileSaver, 'saveAs')
            .mockImplementation(() => {
                throw testError;
            });

        saga.put(saveAs());

        expect(mockEditor.getValue).toHaveBeenCalled();

        const action = await saga.take();
        expect(action).toEqual(didFailToSaveAs(testError));
        expect(mockFileSaverSaveAs).toHaveBeenCalled();

        await saga.end();

        mockFileSaverSaveAs.mockRestore();
    });
});
