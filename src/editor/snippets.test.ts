// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import ace from 'ace-builds';

import './snippets';

type Snippets = {
    snippetText: string;
    scope: string;
};

it('indents with tabs', () => {
    const { snippetText, scope } = ace.require('ace/snippets/python') as Snippets;

    expect(scope).toBe('python');

    for (const line of snippetText.split('\n')) {
        expect(line).not.toMatch(/^(\t* )+\t*/);
    }
});
