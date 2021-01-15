// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { lookup } from '../../test';
import { SettingsStringId } from './settings-i18n';
import en from './settings-i18n.en.json';

describe('Ensure .json file has matches for SettingsStringIds', () => {
    test.each(Object.values(SettingsStringId))('%s', (id) => {
        expect(lookup(en, id)).toBeDefined();
    });
});
