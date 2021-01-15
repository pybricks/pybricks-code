// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { lookup } from '../../test';
import { AboutStringId } from './about-i18n';
import en from './about-i18n.en.json';

describe('Ensure .json file has matches for AboutStringId', () => {
    test.each(Object.values(AboutStringId))('%s', (id) => {
        expect(lookup(en, id)).toBeDefined();
    });
});
