// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Classes, Icon, IconName } from '@blueprintjs/core';
import { useI18n } from '@shopify/react-i18n';
import React, { useCallback, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { I18nId } from './i18n';

/** Indicates the selected activity. */
export enum Activity {
    /** No activity is selected. */
    None = 'activity.none',
    /** The explorer activity is selected. */
    Explorer = 'activity.explorer',
    /** The settings activity is selected. */
    Settings = 'activity.settings',
}

type ActivityTabProps = {
    /** The label for the tab. */
    label: string;
    /** The icon for the tab. */
    icon: IconName;
    /** Controls the selected state of the tab. */
    selected: boolean;
    /** Callback called when the tab is clicked. */
    onClick: () => void;
};

/**
 * React component for tabs in {@link Activities}.
 */
const ActivityTab: React.VoidFunctionComponent<ActivityTabProps> = ({
    label,
    icon,
    selected,
    onClick,
}) => {
    // not using Button component so we can set role to "tab"
    return (
        <div
            role="tab"
            title={label}
            aria-selected={selected}
            tabIndex={0}
            className={[
                'pb-activity-tablist-tab',
                Classes.BUTTON,
                Classes.MINIMAL,
                selected ? Classes.INTENT_PRIMARY : undefined,
            ]
                .filter((c) => c)
                .join(' ')}
            {...{ onClick }}
        >
            <Icon size={35} {...{ icon }} />
        </div>
    );
};

type ActivitiesProps = {
    /** The currently selected activity. */
    selectedActivity: Activity;
    /** Callback called when a tab is clicked. */
    onAction: (activity: Activity) => void;
};

/**
 * React component that acts as a tab control to select activities.
 */
const Activities: React.VoidFunctionComponent<ActivitiesProps> = ({
    selectedActivity,
    onAction,
}) => {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();

    return (
        <div
            aria-label={i18n.translate(I18nId.Title)}
            role="tablist"
            className="pb-activity-tablist"
        >
            <ActivityTab
                label={i18n.translate(I18nId.Explorer)}
                selected={selectedActivity === Activity.Explorer}
                icon="document"
                onClick={() => onAction(Activity.Explorer)}
            />
            <ActivityTab
                label={i18n.translate(I18nId.Settings)}
                selected={selectedActivity === Activity.Settings}
                icon="cog"
                onClick={() => onAction(Activity.Settings)}
            />
        </div>
    );
};

/**
 * React hook to get selected state and component.
 * @returns The current selected activity (state) and the activity component.
 */
export function useActivities(): [
    selectedActivity: Activity,
    activitiesComponent: React.ReactElement,
] {
    const [selectedActivity, setSelectedActivity] = useLocalStorage(
        'activities.selectedActivity',
        Activity.Explorer,
    );

    const handleAction = useCallback(
        (newActivity: Activity) => {
            // if activity is already selected, select none
            if (selectedActivity === newActivity) {
                setSelectedActivity(Activity.None);
            } else {
                // otherwise select the new activity
                setSelectedActivity(newActivity);
            }
        },
        [selectedActivity, setSelectedActivity],
    );

    const activitiesComponent = useMemo(
        () => (
            <Activities
                selectedActivity={selectedActivity}
                onAction={(a) => handleAction(a)}
            />
        ),
        [Activities, selectedActivity, handleAction],
    );

    return [selectedActivity, activitiesComponent];
}
