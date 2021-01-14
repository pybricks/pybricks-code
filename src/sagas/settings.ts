// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// This manages settings by storing them in local storage whenever the app
// request to set a setting. When local storage changes, it triggers a did
// change action that can be used by reducers to compute the new state.

import { EventChannel, eventChannel } from 'redux-saga';
import { call, fork, put, select, take, takeEvery } from 'redux-saga/effects';
import { AppActionType } from '../actions/app';
import {
    SettingsActionType,
    SettingsSetBooleanAction,
    didBooleanChange,
    didFailToSetBoolean,
} from '../actions/settings';
import { RootState } from '../reducers';
import { SettingId, getDefaultBooleanValue } from '../settings';

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
    const chan = (yield call(
        createLocalStorageEventChannel,
    )) as EventChannel<StorageEvent>;

    while (true) {
        const event = (yield take(chan)) as StorageEvent;

        // only care about storage keys 'setting.*'
        if (!event.key?.startsWith('setting.')) {
            continue;
        }

        const id = event.key.replace(/^setting\./, '') as SettingId;

        // istanbul ignore if: should not happen normally
        if (!Object.values(SettingId).includes(id)) {
            console.error(`Bad setting id: ${id}`);
            continue;
        }

        yield put(didBooleanChange(id, stringToBoolean(event.newValue || 'false')));
    }
}

function* loadSettings(): Generator {
    for (const id of Object.values(SettingId)) {
        const storageValue = localStorage.getItem(`setting.${id}`);
        const defaultValue = getDefaultBooleanValue(id);
        const value =
            storageValue === null ? defaultValue : stringToBoolean(storageValue);

        if (value !== defaultValue) {
            yield put(didBooleanChange(id, value));
        }
    }
}

function* storeSetting(action: SettingsSetBooleanAction): Generator {
    const key = `setting.${action.id}`;
    const newValue = String(action.newState);

    try {
        localStorage.setItem(key, newValue);
    } catch (err) {
        yield put(didFailToSetBoolean(action.id, err));
    }

    // storage event is only raised when a value is changed externally, so we
    // mimic the event when we call setItem(), whether it actually succeeded
    // or not.
    const oldState = (yield select((s: RootState) => s.settings[action.id])) as boolean;
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

export default function* (): Generator {
    yield fork(monitorLocalStorage);
    yield takeEvery(AppActionType.Startup, loadSettings);
    yield takeEvery(SettingsActionType.SetBoolean, storeSetting);
}
