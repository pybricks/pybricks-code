// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './activities.scss';
import React from 'react';
import Explorer from '../explorer/Explorer';
import Settings from '../settings/Settings';
import { Activity, useActivitiesSelectedActivity } from './hooks';

/**
 * React component that renders the panel content for the selected activity.
 */
const Activities: React.FunctionComponent = () => {
    const [selectedActivity] = useActivitiesSelectedActivity();
    if (selectedActivity === Activity.Explorer) {
        return (
            <div className="pb-activities-tabview">
                <Explorer />
            </div>
        );
    }

    if (selectedActivity === Activity.Settings) {
        return (
            <div className="pb-activities-tabview">
                <Settings />
            </div>
        );
    }

    return null;
};

export default Activities;
