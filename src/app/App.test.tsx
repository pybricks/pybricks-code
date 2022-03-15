// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../test';
import App from './App';

beforeAll(() => {
    // this lets us use jest.spyOn with window.innerWidth
    const defaultInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
        get: () => defaultInnerWidth,
    });
});

afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    localStorage.clear();
});

it.each([false, true])('should render', (darkMode) => {
    localStorage.setItem(
        'usehooks-ts-ternary-dark-mode',
        JSON.stringify(darkMode ? 'dark' : 'light'),
    );
    testRender(<App />);
});

describe('documentation pane', () => {
    it('should show by default on large screens', () => {
        jest.spyOn(window, 'innerWidth', 'get').mockReturnValue(1024);
        testRender(<App />);
        expect(document.querySelector('.pb-show-docs')).not.toBeNull();
        expect(document.querySelector('.pb-hide-docs')).toBeNull();
    });

    it('should hide by default on small screens', () => {
        jest.spyOn(window, 'innerWidth', 'get').mockReturnValue(800);
        testRender(<App />);
        expect(document.querySelector('.pb-show-docs')).toBeNull();
        expect(document.querySelector('.pb-hide-docs')).not.toBeNull();
    });
});
