// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { lookup } from '../../test';
import { MessageId } from './notification-i18n';
import en from './notification-i18n.en.json';

describe('Ensure .json file has matches for MessageIds', () => {
    test.each(Object.values(MessageId))('%s', (id) => {
        expect(lookup(en, id)).toBeDefined();
    });
});
