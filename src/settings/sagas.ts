// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// This manages settings by storing them in local storage whenever the app
// request to set a setting. When local storage changes, it triggers a did
// change action that can be used by reducers to compute the new state.

import { EventChannel, eventChannel } from 'redux-saga';
import { call, fork, put, select, take, takeEvery } from 'typed-redux-saga/macro';
import { AppActionType } from '../app/actions';
import { RootState } from '../reducers';
import { ensureError } from '../utils';
import {
    SettingsActionType,
    SettingsSetBooleanAction,
    SettingsSetStringAction,
    SettingsToggleBooleanAction,
    didBooleanChange,
    didFailToSetBoolean,
    didFailToSetString,
    didStringChange,
    setBoolean,
} from './actions';
import {
    BooleanSettingId,
    StringSettingId,
    getDefaultBooleanValue,
    getDefaultStringValue,
} from './defaults';

function stringToBoolean(value: string): boolean {
    return value.toLowerCase().match(/(true|yes|1)/) !== null;
}

function createLocalStorageEventChannel(): EventChannel<StorageEvent> {
    return eventChannel((emitter) => {
        const handler: (e: StorageEvent) => void = (e) => {
            if (e.storageArea !== localStorage) {
                return;
            }
            emitter(e);
        };
        window.addEventListener('storage', handler);
        // istanbul ignore next: this is not normally called
        return () => window.removeEventListener('storage', handler);
    });
}

function* monitorLocalStorage(): Generator {
    const chan = yield* call(createLocalStorageEventChannel);

    while (true) {
        const event = yield* take(chan);

        // only care about storage keys 'setting.*'
        if (!event.key?.startsWith('setting.')) {
            continue;
        }

        const id = event.key.replace(/^setting\./, '');

        if (Object.values(BooleanSettingId).includes(id as BooleanSettingId)) {
            yield* put(
                didBooleanChange(
                    id as BooleanSettingId,
                    stringToBoolean(event.newValue || 'false'),
                ),
            );
            continue;
        }

        if (Object.values(StringSettingId).includes(id as StringSettingId)) {
            yield* put(didStringChange(id as StringSettingId, event.newValue || ''));
            continue;
        }

        // istanbul ignore next: should not happen normally
        console.error(`Bad setting id: ${id}`);
    }
}

function* loadSettings(): Generator {
    for (const id of Object.values(BooleanSettingId)) {
        const storageValue = localStorage.getItem(`setting.${id}`);
        const defaultValue = getDefaultBooleanValue(id);
        const value =
            storageValue === null ? defaultValue : stringToBoolean(storageValue);

        if (value !== defaultValue) {
            yield* put(didBooleanChange(id, value));
        }
    }

    for (const id of Object.values(StringSettingId)) {
        const storageValue = localStorage.getItem(`setting.${id}`);
        const defaultValue = getDefaultStringValue(id);
        const value = storageValue === null ? defaultValue : storageValue;

        if (value !== defaultValue) {
            yield* put(didStringChange(id, value));
        }
    }
}

function* storeBooleanSetting(action: SettingsSetBooleanAction): Generator {
    const key = `setting.${action.id}`;
    const newValue = String(action.newState);

    try {
        localStorage.setItem(key, newValue);
    } catch (err) {
        yield* put(didFailToSetBoolean(action.id, ensureError(err)));
    }

    // storage event is only raised when a value is changed externally, so we
    // mimic the event when we call setItem(), whether it actually succeeded
    // or not.
    const oldState = yield* select((s: RootState) => s.settings[action.id]);
    if (action.newState !== oldState) {
        window.dispatchEvent(
            new StorageEvent('storage', {
                key,
                newValue,
                oldValue: String(oldState),
                storageArea: localStorage,
            }),
        );
    }
}

function* toggleBooleanSetting(action: SettingsToggleBooleanAction): Generator {
    const oldValue = yield* select((s: RootState) => s.settings[action.id]);
    yield* storeBooleanSetting(setBoolean(action.id, !oldValue));
}

function* storeStringSetting(action: SettingsSetStringAction): Generator {
    const key = `setting.${action.id}`;
    const newValue = action.newState;

    try {
        localStorage.setItem(key, newValue);
    } catch (err) {
        yield* put(didFailToSetString(action.id, ensureError(err)));
    }

    // storage event is only raised when a value is changed externally, so we
    // mimic the event when we call setItem(), whether it actually succeeded
    // or not.
    const oldValue = yield* select((s: RootState) => s.settings[action.id]);
    if (action.newState !== oldValue) {
        window.dispatchEvent(
            new StorageEvent('storage', {
                key,
                newValue,
                oldValue,
                storageArea: localStorage,
            }),
        );
    }
}

export default function* (): Generator {
    yield* fork(monitorLocalStorage);
    yield* takeEvery(AppActionType.DidStart, loadSettings);
    yield* takeEvery(SettingsActionType.SetBoolean, storeBooleanSetting);
    yield* takeEvery(SettingsActionType.ToggleBoolean, toggleBooleanSetting);
    yield* takeEvery(SettingsActionType.SetString, storeStringSetting);
}
