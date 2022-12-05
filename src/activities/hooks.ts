// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { useEffect } from 'react';
import { useEffectOnce, useLocalStorage, useSessionStorage } from 'usehooks-ts';

/** Indicates the selected activity. */
export enum Activity {
    /** No activity is selected. */
    None = 'activity.none',
    /** The explorer activity is selected. */
    Explorer = 'activity.explorer',
    /** The settings activity is selected. */
    Settings = 'activity.settings',
}

/**
 * React hook for getting and setting the selected activity in the activity panel.
 * @returns a tuple of the current state and the setter function (like useState()).
 */
export function useActivitiesSelectedActivity(): ReturnType<
    typeof useSessionStorage<Activity>
> {
    // If multiple windows are open, this allows each window to control the
    // current activity independently. The local storage uses a "last one wins"
    // approach to deciding which state to restore when a window is opened.
    const [lastSelectedActivity, setLastSelectedActivity] = useLocalStorage(
        'activities.selectedActivity',
        Activity.Explorer,
    );

    const [selectedActivity, setSelectedActivity] = useSessionStorage(
        'activities.selectedActivity',
        lastSelectedActivity,
    );

    // Force writing to session storage since default value is not constant.
    useEffectOnce(() => setSelectedActivity(selectedActivity));

    useEffect(() => {
        setLastSelectedActivity(selectedActivity);
    }, [selectedActivity]);

    return [selectedActivity, setSelectedActivity];
}
