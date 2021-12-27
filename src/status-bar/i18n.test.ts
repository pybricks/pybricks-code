// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { lookup } from '../../test';
import { MessageId } from './i18n';
import en from './i18n.en.json';

describe('Ensure .json file has matches for MessageIds', () => {
    test.each(Object.values(MessageId))('%s', (id) => {
        expect(lookup(en, id)).toBeDefined();
    });
});
