// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

// This manages settings by storing them in local storage whenever the app
// request to set a setting. When local storage changes, it triggers a did
// change action that can be used by reducers to compute the new state.

import { EventChannel, eventChannel } from 'redux-saga';
import { call, fork, put, select, take, takeEvery } from 'typed-redux-saga/macro';
import { didStart } from '../app/actions';
import { RootState } from '../reducers';
import { ensureError } from '../utils';
import {
    didFailToSetString,
    didStringChange,
    setString,
    settingsToggleShowDocs,
} from './actions';
import { StringSettingId, getDefaultStringValue } from './defaults';

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

        if (Object.values(StringSettingId).includes(id as StringSettingId)) {
            yield* put(didStringChange(id as StringSettingId, event.newValue || ''));
            continue;
        }

        // istanbul ignore next: should not happen normally
        console.error(`Bad setting id: ${id}`);
    }
}

function* loadSettings(): Generator {
    for (const id of Object.values(StringSettingId)) {
        const storageValue = localStorage.getItem(`setting.${id}`);
        const defaultValue = getDefaultStringValue(id);
        const value = storageValue === null ? defaultValue : storageValue;

        if (value !== defaultValue) {
            yield* put(didStringChange(id, value));
        }
    }
}

function* storeStringSetting(action: ReturnType<typeof setString>): Generator {
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

/**
 * Hack to wire editor action to settings hook.
 *
 * There are a few places where using toggleIsSettingShowDocsEnabled() doesn't
 * work because it needs to be called from outside of a React component that
 * doesn't get updated when state changes.
 */
function* handleToggleShowDocs(): Generator {
    // HACK: This depends on the implementation detail that
    // useSettingIsShowDocsEnabled() uses useLocalStorage() internally.
    yield* call(() => {
        const key = 'setting.showDocs';
        const oldValue = localStorage.getItem(key);
        const newValue = JSON.stringify(!(oldValue && JSON.parse(oldValue)));
        localStorage.setItem(key, newValue);
        window.dispatchEvent(new Event('local-storage'));
    });
}

export default function* (): Generator {
    yield* fork(monitorLocalStorage);
    yield* takeEvery(didStart, loadSettings);
    yield* takeEvery(setString, storeStringSetting);
    yield* takeEvery(settingsToggleShowDocs, handleToggleShowDocs);
}
