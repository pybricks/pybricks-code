// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Tests for settings sagas.

import { AsyncSaga } from '../../test';
import {
    didFailToSetString,
    didStringChange,
    setString,
    settingsToggleShowDocs,
} from './actions';
import { StringSettingId } from './defaults';
import settings from './sagas';

afterEach(() => {
    jest.restoreAllMocks();
});

describe('store settings to local storage', () => {
    test('failed storage', async () => {
        const saga = new AsyncSaga(settings);

        const testError = new Error('local storage is disabled');

        const mockSetItem = jest
            .spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
            .mockImplementation(() => {
                throw testError;
            });

        saga.put(setString(StringSettingId.HubName, 'test name'));
        expect(mockSetItem).toHaveBeenCalled();

        // raises error that storing setting didn't work
        const action3 = await saga.take();
        expect(action3).toEqual(didFailToSetString(StringSettingId.HubName, testError));

        // but the setting is still applied anyway
        const action4 = await saga.take();
        expect(action4).toEqual(didStringChange(StringSettingId.HubName, 'test name'));

        await saga.end();
    });
});

describe('storage monitor', () => {
    test('ignores other keys', async () => {
        const saga = new AsyncSaga(settings);

        window.dispatchEvent(
            new StorageEvent('storage', {
                key: 'not a setting',
                storageArea: localStorage,
            }),
        );

        // nothing happens

        await saga.end();
    });

    test('ignores session storage', async () => {
        const saga = new AsyncSaga(settings);

        window.dispatchEvent(
            new StorageEvent('storage', {
                key: 'setting.showDocs',
                newValue: 'true',
                oldValue: 'false',
                storageArea: sessionStorage,
            }),
        );

        // nothing happens

        await saga.end();
    });
});

describe('handleToggleShowDocs', () => {
    it('should toggle the showDocs setting', async () => {
        const key = 'setting.showDocs';
        const saga = new AsyncSaga(settings);

        saga.put(settingsToggleShowDocs());
        expect(localStorage.getItem(key)).toBe('true');

        saga.put(settingsToggleShowDocs());
        expect(localStorage.getItem(key)).toBe('false');

        await saga.end();
    });
});
