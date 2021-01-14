// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors
// File: sagas/app.test.ts
// Tests for app sagas.

import { AsyncSaga } from '../../test';
import { startup } from '../actions/app';
import { SettingsActionType, toggleDarkMode, toggleDocs } from '../actions/settings';
import settings from './settings';

afterAll(() => {
    jest.restoreAllMocks();
});

describe('startup', () => {
    test('with large screen', async () => {
        const saga = new AsyncSaga(settings);

        jest.spyOn(
            Object.getPrototypeOf(window.localStorage),
            'getItem',
        ).mockReturnValue(null);
        innerWidth = 1024;

        saga.put(startup());

        // toggles documentation to be visible
        const toggleDocsAction = await saga.take();
        expect(toggleDocsAction.type).toBe(SettingsActionType.ToggleDocs);

        await saga.end();
    });

    test('with small screen', async () => {
        const saga = new AsyncSaga(settings);

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
        const saga = new AsyncSaga(settings);

        jest.spyOn(
            Object.getPrototypeOf(window.localStorage),
            'getItem',
        ).mockReturnValue('{"showDocs":true}');
        innerWidth = 800;

        saga.put(startup());

        // toggles documentation to be visible
        const toggleDocsAction = await saga.take();
        expect(toggleDocsAction.type).toBe(SettingsActionType.ToggleDocs);

        await saga.end();
    });

    test('with stored value "false"', async () => {
        const saga = new AsyncSaga(settings);

        jest.spyOn(
            Object.getPrototypeOf(window.localStorage),
            'getItem',
        ).mockReturnValue('{"showDocs":false}');
        innerWidth = 1024;

        saga.put(startup());

        // does nothing

        await saga.end();
    });
});

describe('store settings to local storage', () => {
    test('showDocs', async () => {
        const saga = new AsyncSaga(settings);

        // NOTE: we aren't testing reducers here, so value doesn't change
        // even though we call the toggle function
        const mockSetItem = jest
            .spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
            .mockImplementation((_key, value) =>
                expect(value).toBe('{"darkMode":false,"showDocs":true}'),
            );
        saga.setState({ settings: { darkMode: false, showDocs: true } });
        saga.put(toggleDocs());
        expect(mockSetItem).toHaveBeenCalled();

        await saga.end();
    });

    test('darkMode', async () => {
        const saga = new AsyncSaga(settings);

        // NOTE: we aren't testing reducers here, so value doesn't change
        // even though we call the toggle function
        const mockSetItem = jest
            .spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
            .mockImplementation((_key, value) =>
                expect(value).toBe('{"darkMode":true,"showDocs":false}'),
            );
        saga.setState({ settings: { darkMode: true, showDocs: false } });
        saga.put(toggleDarkMode());
        expect(mockSetItem).toHaveBeenCalled();

        await saga.end();
    });
});
