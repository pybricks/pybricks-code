// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { useLocalStorage } from 'usehooks-ts';

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
export function useActivitiesSelectedActivity() {
    return useLocalStorage('activities.selectedActivity', Activity.Explorer);
}
