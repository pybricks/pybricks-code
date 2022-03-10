// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { lookup } from '../../test';
import { ExplorerStringId } from './i18n';
import en from './i18n.en.json';

describe('Ensure .json file has matches for ExplorerStringId', () => {
    test.each(Object.values(ExplorerStringId))('%s', (id) => {
        expect(lookup(en, id)).toBeDefined();
    });
});
