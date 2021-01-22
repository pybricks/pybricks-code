// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors
// File: sagas/settings.test.ts
// Tests for settings sagas.

import { AsyncSaga } from '../../test';
import { didStart } from '../actions/app';
import { didBooleanChange, didFailToSetBoolean, setBoolean } from '../actions/settings';
import { SettingId } from '../settings/user';
import settings from './settings';

afterAll(() => {
    jest.restoreAllMocks();
});

describe('startup', () => {
    describe('showDocs', () => {
        test('with large screen and no value set', async () => {
            const saga = new AsyncSaga(settings);

            jest.spyOn(
                Object.getPrototypeOf(window.localStorage),
                'getItem',
            ).mockReturnValue(null);
            innerWidth = 1024;

            saga.put(didStart());

            // does nothing

            await saga.end();
        });

        test('with small screen and no value set', async () => {
            const saga = new AsyncSaga(settings);

            jest.spyOn(
                Object.getPrototypeOf(window.localStorage),
                'getItem',
            ).mockReturnValue(null);
            innerWidth = 800;

            saga.put(didStart());

            // does nothing

            await saga.end();
        });

        test('with large screen and stored value "true"', async () => {
            const saga = new AsyncSaga(settings);

            jest.spyOn(
                Object.getPrototypeOf(window.localStorage),
                'getItem',
            ).mockImplementation((key) => {
                switch (key) {
                    case 'setting.showDocs':
                        return 'true';
                    default:
                        return null;
                }
            });
            innerWidth = 1024;

            saga.put(didStart());

            // does nothing

            await saga.end();
        });

        test('with small screen and stored value "true"', async () => {
            const saga = new AsyncSaga(settings);

            jest.spyOn(
                Object.getPrototypeOf(window.localStorage),
                'getItem',
            ).mockImplementation((key) => {
                switch (key) {
                    case 'setting.showDocs':
                        return 'true';
                    default:
                        return null;
                }
            });
            innerWidth = 800;

            saga.put(didStart());

            // requests documentation to be shown
            const action = await saga.take();
            expect(action).toEqual(didBooleanChange(SettingId.ShowDocs, true));

            await saga.end();
        });

        test('with large screen stored value "false"', async () => {
            const saga = new AsyncSaga(settings);

            jest.spyOn(
                Object.getPrototypeOf(window.localStorage),
                'getItem',
            ).mockImplementation((key) => {
                switch (key) {
                    case 'setting.showDocs':
                        return 'false';
                    default:
                        return null;
                }
            });
            innerWidth = 1024;

            saga.put(didStart());

            // requests documentation to be hidden
            const action = await saga.take();
            expect(action).toEqual(didBooleanChange(SettingId.ShowDocs, false));

            await saga.end();
        });

        test('with small screen stored value "false"', async () => {
            const saga = new AsyncSaga(settings);

            jest.spyOn(
                Object.getPrototypeOf(window.localStorage),
                'getItem',
            ).mockImplementation((key) => {
                switch (key) {
                    case 'setting.showDocs':
                        return 'false';
                    default:
                        return null;
                }
            });
            innerWidth = 800;

            saga.put(didStart());

            // does nothing

            await saga.end();
        });
    });

    describe('darkMode', () => {
        test('with no value set', async () => {
            const saga = new AsyncSaga(settings);

            jest.spyOn(
                Object.getPrototypeOf(window.localStorage),
                'getItem',
            ).mockReturnValue(null);

            saga.put(didStart());

            // does nothing

            await saga.end();
        });

        test('with value set to true', async () => {
            const saga = new AsyncSaga(settings);

            jest.spyOn(
                Object.getPrototypeOf(window.localStorage),
                'getItem',
            ).mockImplementation((key) => {
                switch (key) {
                    case 'setting.darkMode':
                        return 'true';
                    default:
                        return null;
                }
            });

            saga.put(didStart());

            // requests to enable dark mode
            const action = await saga.take();
            expect(action).toEqual(didBooleanChange(SettingId.DarkMode, true));

            await saga.end();
        });

        test('with value set to false', async () => {
            const saga = new AsyncSaga(settings);

            jest.spyOn(
                Object.getPrototypeOf(window.localStorage),
                'getItem',
            ).mockImplementation((key) => {
                switch (key) {
                    case 'setting.darkMode':
                        return 'false';
                    default:
                        return null;
                }
            });

            saga.put(didStart());

            // does nothing

            await saga.end();
        });
    });
});

describe('store settings to local storage', () => {
    test('failed storage', async () => {
        const saga = new AsyncSaga(settings, { settings: { showDocs: false } });

        const testError = new Error('local storage is disabled');

        const mockSetItem = jest
            .spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
            .mockImplementation(() => {
                throw testError;
            });

        saga.put(setBoolean(SettingId.ShowDocs, true));
        expect(mockSetItem).toHaveBeenCalled();

        // raises error that storing setting didn't work
        const action1 = await saga.take();
        expect(action1).toEqual(didFailToSetBoolean(SettingId.ShowDocs, testError));

        // but the setting is still applied anyway
        const action2 = await saga.take();
        expect(action2).toEqual(didBooleanChange(SettingId.ShowDocs, true));

        await saga.end();
    });

    test('showDocs', async () => {
        const saga = new AsyncSaga(settings, { settings: { showDocs: false } });

        const mockSetItem = jest
            .spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
            .mockImplementation((key, value) => {
                expect(key).toBe('setting.showDocs');
                expect(value).toBe('true');
            });

        saga.put(setBoolean(SettingId.ShowDocs, true));
        expect(mockSetItem).toHaveBeenCalled();

        const action = await saga.take();
        expect(action).toEqual(didBooleanChange(SettingId.ShowDocs, true));

        await saga.end();
    });

    test('darkMode', async () => {
        const saga = new AsyncSaga(settings, { settings: { darkMode: true } });

        const mockSetItem = jest
            .spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
            .mockImplementation((key, value) => {
                expect(key).toBe('setting.darkMode');
                expect(value).toBe('false');
            });

        saga.put(setBoolean(SettingId.DarkMode, false));
        expect(mockSetItem).toHaveBeenCalled();

        const action = await saga.take();
        expect(action).toEqual(didBooleanChange(SettingId.DarkMode, false));

        await saga.end();
    });

    test('flashCurrentProgram', async () => {
        const saga = new AsyncSaga(settings, {
            settings: { flashCurrentProgram: true },
        });

        const mockSetItem = jest
            .spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
            .mockImplementation((key, value) => {
                expect(key).toBe('setting.flashCurrentProgram');
                expect(value).toBe('false');
            });

        saga.put(setBoolean(SettingId.FlashCurrentProgram, false));
        expect(mockSetItem).toHaveBeenCalled();

        const action = await saga.take();
        expect(action).toEqual(didBooleanChange(SettingId.FlashCurrentProgram, false));

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

    test('puts action when setting changes', async () => {
        const saga = new AsyncSaga(settings);

        window.dispatchEvent(
            new StorageEvent('storage', {
                key: 'setting.showDocs',
                newValue: 'true',
                oldValue: 'false',
                storageArea: localStorage,
            }),
        );

        const action = await saga.take();
        expect(action).toEqual(didBooleanChange(SettingId.ShowDocs, true));

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
