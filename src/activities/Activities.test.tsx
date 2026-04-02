// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { cleanup } from '@testing-library/react';
import React from 'react';
import { testRender } from '../../test';
import Activities from './Activities';
import { Activity } from './hooks';

afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
});

describe('Activities', () => {
    it('should render explorer by default', () => {
        const [, activities] = testRender(<Activities />);

        expect(
            activities.container.querySelector('.pb-activities-tabview'),
        ).toBeInTheDocument();
    });

    it('should render settings when Settings activity is selected', () => {
        sessionStorage.setItem(
            'activities.selectedActivity',
            JSON.stringify(Activity.Settings),
        );

        const [, activities] = testRender(<Activities />);

        expect(
            activities.container.querySelector('.pb-activities-tabview'),
        ).toBeInTheDocument();
    });

    it('should render nothing when no activity is selected', () => {
        sessionStorage.setItem(
            'activities.selectedActivity',
            JSON.stringify(Activity.None),
        );

        const [, activities] = testRender(<Activities />);

        expect(
            activities.container.querySelector('.pb-activities-tabview'),
        ).not.toBeInTheDocument();
    });
});
