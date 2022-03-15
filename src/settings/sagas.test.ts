// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors
//
// Tests for settings sagas.

import { AsyncSaga } from '../../test';
import { settingsToggleShowDocs } from './actions';
import settings from './sagas';

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
