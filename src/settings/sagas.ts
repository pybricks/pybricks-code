// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

// This manages settings by storing them in local storage whenever the app
// request to set a setting. When local storage changes, it triggers a did
// change action that can be used by reducers to compute the new state.

import { call, takeEvery } from 'typed-redux-saga/macro';
import { settingsToggleShowDocs } from './actions';

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
    yield* takeEvery(settingsToggleShowDocs, handleToggleShowDocs);
}
