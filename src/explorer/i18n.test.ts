// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { lookup } from '../../test';
import { ExplorerStringId, NewFileWizardStringId } from './i18n';
import en from './i18n.en.json';

describe('Ensure .json file has matches for ExplorerStringId', () => {
    test.each(Object.values(ExplorerStringId))('%s', (id) => {
        expect(lookup(en, id)).toBeDefined();
    });
});

describe('Ensure .json file has matches for NewFileWizardStringId', () => {
    test.each(Object.values(NewFileWizardStringId))('%s', (id) => {
        expect(lookup(en, id)).toBeDefined();
    });
});
