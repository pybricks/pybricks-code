// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { TooltipId } from './button';
import en from './button.en.json';

function lookup(obj: object, id: string): string | undefined {
    const value = id
        .split('.')
        .reduce((pv, cv) => pv && (pv as Record<string, object>)[cv], obj);
    if (typeof value === 'string') {
        return value;
    }
    return undefined;
}

describe('Ensure .json file has matches for TooltipIds', () => {
    test.each(Object.values(TooltipId))('%s', (id) => {
        expect(lookup(en, id)).toBeDefined();
    });
});
