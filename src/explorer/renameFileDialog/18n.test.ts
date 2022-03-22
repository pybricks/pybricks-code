// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { lookup } from '../../../test';
import { RenameFileDialogStringId } from './i18n';
import en from './i18n.en.json';

describe('Ensure .json file has matches for RenameFileStringId', () => {
    test.each(Object.values(RenameFileDialogStringId))('%s', (id) => {
        expect(lookup(en, id)).toBeDefined();
    });
});
