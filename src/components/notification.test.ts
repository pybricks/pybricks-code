// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { MessageId } from '../reducers/notification';
import { lookup } from '../utils';
import en from './notification.en.json';

describe('Ensure .json file has matches for MessageIds', () => {
    test.each(Object.values(MessageId))('%s', (id) => {
        expect(lookup(en, id)).toBeDefined();
    });
});
