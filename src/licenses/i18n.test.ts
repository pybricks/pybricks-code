// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { lookup } from '../../test';
import { LicenseStringId } from './i18n';
import en from './i18n.en.json';

describe('Ensure .json file has matches for LicenseStringId', () => {
    test.each(Object.values(LicenseStringId))('%s', (id) => {
        expect(lookup(en, id)).toBeDefined();
    });
});
