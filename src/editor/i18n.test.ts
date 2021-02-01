// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { lookup } from '../../test';
import { EditorStringId } from './i18n';
import en from './i18n.en.json';

describe('Ensure .json file has matches for EditorStringId', () => {
    test.each(Object.values(EditorStringId))('%s', (id) => {
        expect(lookup(en, id)).toBeDefined();
    });
});
