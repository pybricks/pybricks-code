// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import './activities.scss';
import { Icon, Tab, Tabs } from '@blueprintjs/core';
import React, { useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import Explorer from '../explorer/Explorer';
import Settings from '../settings/Settings';
import { I18nId, useI18n } from './i18n';

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
 * React component that acts as a tab control to select activities.
 */
const Activities: React.VoidFunctionComponent = () => {
    const i18n = useI18n();

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

    // HACK: fix keyboard focus when no tab is selected

    const tabsRef = useRef<Tabs>(null);

    useEffect(() => {
        if (selectedActivity !== Activity.None) {
            // all is well
            return;
        }

        // @ts-expect-error: using private property
        const tablist: HTMLDivElement = tabsRef.current?.tablistElement;

        // istanbul-ignore-if: should not happen
        if (!tablist) {
            return;
        }

        const firstTab = tablist
            .getElementsByClassName('pb-activities-tablist-tab')
            .item(0);

        // istanbul-ignore-if: should not happen
        if (!firstTab) {
            return;
        }

        firstTab.setAttribute('tabindex', '0');
    }, [tabsRef, selectedActivity]);

    // HACK: hoist html title attribute from icon to tab

    useEffect(() => {
        // @ts-expect-error: using private property
        const tablist: HTMLDivElement = tabsRef.current?.tablistElement;

        // istanbul-ignore-if: should not happen
        if (!tablist) {
            return;
        }

        for (const element of tablist.getElementsByClassName(
            'pb-activities-tablist-tab',
        )) {
            const title = element.firstElementChild?.getAttribute('title');

            // istanbul-ignore-if: should not happen
            if (!title) {
                continue;
            }

            element.setAttribute('title', title);
            element.firstElementChild?.removeAttribute('title');
        }
    }, [tabsRef]);

    return (
        <Tabs
            aria-label={i18n.translate(I18nId.Title)}
            vertical={true}
            className="pb-activities"
            selectedTabId={selectedActivity}
            onChange={handleAction}
            ref={tabsRef}
        >
            <Tab
                aria-label={i18n.translate(I18nId.Explorer)}
                className="pb-activities-tablist-tab"
                id={Activity.Explorer}
                title={
                    <Icon
                        htmlTitle={i18n.translate(I18nId.Explorer)}
                        size={35}
                        icon="document"
                    />
                }
                panel={<Explorer />}
                panelClassName="pb-activities-tabview"
                onMouseDown={(e) => e.stopPropagation()}
            />
            <Tab
                aria-label={i18n.translate(I18nId.Settings)}
                className="pb-activities-tablist-tab"
                id={Activity.Settings}
                title={
                    <Icon
                        htmlTitle={i18n.translate(I18nId.Settings)}
                        size={35}
                        icon="cog"
                    />
                }
                panel={<Settings />}
                panelClassName="pb-activities-tabview"
                onMouseDown={(e) => e.stopPropagation()}
            />
        </Tabs>
    );
};

export default Activities;
