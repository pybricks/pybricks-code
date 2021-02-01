// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { lookup } from '../../test';
import { TerminalStringId } from './i18n';
import en from './i18n.en.json';

describe('Ensure .json file has matches for TerminalStringIds', () => {
    test.each(Object.values(TerminalStringId))('%s', (id) => {
        expect(lookup(en, id)).toBeDefined();
    });
});
