// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors
// File: sagas/app.test.ts
// Tests for app sagas.

import { AsyncSaga } from '../../test';
import { AppActionType, startup, toggleDocs } from '../actions/app';
import app from './app';

afterAll(() => {
    jest.restoreAllMocks();
});

describe('startup', () => {
    test('with large screen', async () => {
        const saga = new AsyncSaga(app);

        jest.spyOn(
            Object.getPrototypeOf(window.localStorage),
            'getItem',
        ).mockReturnValue(null);
        innerWidth = 1024;

        saga.put(startup());

        // toggles documentation to be visible
        const toggleDocsAction = await saga.take();
        expect(toggleDocsAction.type).toBe(AppActionType.ToggleDocs);

        await saga.end();
    });

    test('with small screen', async () => {
        const saga = new AsyncSaga(app);

        jest.spyOn(
            Object.getPrototypeOf(window.localStorage),
            'getItem',
        ).mockReturnValue(null);
        innerWidth = 800;

        saga.put(startup());

        // does nothing

        await saga.end();
    });

    test('with stored value "true"', async () => {
        const saga = new AsyncSaga(app);

        jest.spyOn(
            Object.getPrototypeOf(window.localStorage),
            'getItem',
        ).mockReturnValue('true');
        innerWidth = 800;

        saga.put(startup());

        // toggles documentation to be visible
        const toggleDocsAction = await saga.take();
        expect(toggleDocsAction.type).toBe(AppActionType.ToggleDocs);

        await saga.end();
    });

    test('with stored value "false"', async () => {
        const saga = new AsyncSaga(app);

        jest.spyOn(
            Object.getPrototypeOf(window.localStorage),
            'getItem',
        ).mockReturnValue('false');
        innerWidth = 1024;

        saga.put(startup());

        // does nothing

        await saga.end();
    });
});

describe('storeDocsState', () => {
    test('showing', async () => {
        const saga = new AsyncSaga(app);

        const mockSetItem = jest
            .spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
            .mockImplementation((_key, value) => expect(value).toBe('true'));
        saga.setState({ app: { showDocs: true } });
        saga.put(toggleDocs());
        expect(mockSetItem).toHaveBeenCalled();

        await saga.end();
    });

    test('hidden', async () => {
        const saga = new AsyncSaga(app);

        const mockSetItem = jest
            .spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
            .mockImplementation((_key, value) => expect(value).toBe('false'));
        saga.setState({ app: { showDocs: false } });
        saga.put(toggleDocs());
        expect(mockSetItem).toHaveBeenCalled();

        await saga.end();
    });
});
