// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { lookup } from '../../../test';
import { I18nId } from './i18n';
import en from './translations/en.json';

describe('Ensure .json file has matches for I18nId', () => {
    test.each(Object.values(I18nId))('%s', (id) => {
        expect(lookup(en, id)).toBeDefined();
    });
});
