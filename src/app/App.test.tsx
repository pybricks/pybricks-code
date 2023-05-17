// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2023 The Pybricks Authors

import { cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../test';
import App from './App';

jest.mock('react', () => {
    const React = jest.requireActual('react');
    // don't lazy-load, just use fallback for React.Suspense
    React.Suspense = ({ fallback }: Record<string, unknown>) => fallback;
    return React;
});

beforeAll(() => {
    // this lets us use jest.spyOn with window.innerWidth
    const defaultInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
        get: () => defaultInnerWidth,
    });
});

beforeEach(() => {
    // prevent tour popup
    localStorage.setItem('tour.showOnStartup', 'false');
});

afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
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
