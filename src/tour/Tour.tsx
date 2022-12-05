// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Colors, Icon } from '@blueprintjs/core';
import React, { useCallback, useMemo, useState } from 'react';
import Joyride, {
    ACTIONS,
    CallBackProps,
    EVENTS,
    Locale,
    STATUS,
    Step,
    Styles,
} from 'react-joyride';
import { useDispatch } from 'react-redux';
import { useEffectOnce, useLocalStorage, useTernaryDarkMode } from 'usehooks-ts';
import { Activity, useActivitiesSelectedActivity } from '../activities/hooks';
import { appName, legoRegisteredTrademark, pybricksBlue } from '../app/constants';
import { useSelector } from '../reducers';
import { tourStart, tourStop } from './actions';
import { useI18n } from './i18n';

const WelcomeStep = React.memo(function WelcomeStep() {
    const i18n = useI18n();

    return (
        <>
            <p>{i18n.translate('steps.welcome.message', { appName })}</p>
            <p>
                {i18n.translate('steps.welcome.action', {
                    next: <strong>{i18n.translate('next')}</strong>,
                })}
            </p>
        </>
    );
});

const AddFileStep = React.memo(function AddFileStep() {
    const i18n = useI18n();

    return (
        <p>
            {i18n.translate('steps.newFile.message', {
                icon: <Icon icon="plus" style={{ verticalAlign: 'text-top' }} />,
            })}
        </p>
    );
});

const BackupFilesStep = React.memo(function BackupFilesStep() {
    const i18n = useI18n();

    return (
        <>
            <p>{i18n.translate('steps.backupFiles.message')}</p>
            <p>
                {i18n.translate('steps.backupFiles.action', {
                    icon: <Icon icon="archive" style={{ verticalAlign: 'text-top' }} />,
                })}
            </p>
        </>
    );
});

const FlashPybricksFirmwareStep = React.memo(function FlashPybricksFirmwareStep() {
    const i18n = useI18n();

    return (
        <p>
            {i18n.translate('steps.flashPybricksFirmware.message', {
                appName,
            })}
        </p>
    );
});

const RestoreOfficialFirmwareStep = React.memo(function RestoreOfficialFirmwareStep() {
    const i18n = useI18n();

    return (
        <p>
            {i18n.translate('steps.restoreOfficialFirmware.message', {
                lego: legoRegisteredTrademark,
            })}
        </p>
    );
});

const ConnectToHubStep = React.memo(function ConnectToHubStep() {
    const i18n = useI18n();

    return <p>{i18n.translate('steps.connectToHub.message')}</p>;
});

const DownloadAndRunStep = React.memo(function DownloadAndRunStep() {
    const i18n = useI18n();

    return (
        <p>
            {i18n.translate('steps.downloadAndRun.message', {
                icon: <Icon icon="play" style={{ verticalAlign: 'text-top' }} />,
            })}
        </p>
    );
});

const Tour: React.VoidFunctionComponent = () => {
    const [selectedActivity, setSelectedActivity] = useActivitiesSelectedActivity();
    const [showOnStartup, setShowOnStartup] = useLocalStorage(
        'tour.showOnStartup',
        true,
    );
    const [stepIndex, setStepIndex] = useState(0);
    const { isRunning } = useSelector((s) => s.tour);
    const { isDarkMode } = useTernaryDarkMode();
    const dispatch = useDispatch();
    const i18n = useI18n();

    const steps = useMemo<Step[]>(
        () => [
            {
                target:
                    selectedActivity === Activity.Settings
                        ? '#pb-settings-tour-button'
                        : '[itemId=pb-activities-settings-tab]',
                content: <WelcomeStep />,
                disableBeacon: selectedActivity === Activity.Settings,
            },
            {
                target:
                    selectedActivity === Activity.Settings
                        ? '#pb-settings-flash-pybricks-button'
                        : '[itemId=pb-activities-settings-tab]',
                content: <FlashPybricksFirmwareStep />,
                disableBeacon: selectedActivity === Activity.Settings,
            },
            {
                target:
                    selectedActivity === Activity.Settings
                        ? '#pb-settings-flash-official-button'
                        : '[itemId=pb-activities-settings-tab]',
                content: <RestoreOfficialFirmwareStep />,
                disableBeacon: selectedActivity === Activity.Settings,
            },
            {
                target:
                    selectedActivity === Activity.Explorer
                        ? '#pb-explorer-add-button'
                        : '[itemId=pb-activities-explorer-tab]',
                content: <AddFileStep />,
                disableBeacon: selectedActivity === Activity.Explorer,
            },
            {
                target:
                    selectedActivity === Activity.Explorer
                        ? '#pb-explorer-archive-button'
                        : '[itemId=pb-activities-explorer-tab]',
                content: <BackupFilesStep />,
                disableBeacon: selectedActivity === Activity.Explorer,
            },
            {
                target: '#pb-toolbar-bluetooth-button',
                content: <ConnectToHubStep />,
                disableBeacon: true,
            },
            {
                target: '#pb-toolbar-run-button',
                content: <DownloadAndRunStep />,
                disableBeacon: true,
            },
        ],
        [selectedActivity, i18n],
    );

    const styles = useMemo<Styles>(
        () => ({
            options: {
                primaryColor: pybricksBlue,
                // $pt-dark-text-color / $pt-text-color
                textColor: isDarkMode ? Colors.LIGHT_GRAY5 : Colors.DARK_GRAY1,
                // $pt-dark-app-background-color / $pt-app-background-color
                backgroundColor: isDarkMode ? Colors.DARK_GRAY2 : Colors.LIGHT_GRAY5,
                arrowColor: isDarkMode ? Colors.DARK_GRAY2 : Colors.LIGHT_GRAY5,
            },
        }),
        [isDarkMode],
    );

    const locale = useMemo<Locale>(
        () => ({
            back: i18n.translate('back'),
            close: i18n.translate('close'),
            last: i18n.translate('last'),
            next: i18n.translate('next'),
            open: i18n.translate('open'),
            skip: i18n.translate('skip'),
        }),
        [i18n],
    );

    const callback = useCallback(
        (event: CallBackProps) => {
            if (event.action === ACTIONS.CLOSE || event.status === STATUS.FINISHED) {
                dispatch(tourStop());
                setStepIndex(0);
                return;
            }

            if (event.type === EVENTS.STEP_AFTER) {
                const nextIndex = stepIndex + (event.action === ACTIONS.PREV ? -1 : 1);
                const nextStep = steps.at(nextIndex);

                // Some components may not be mounted when the next/back button
                // is pressed. If this is the case, first target the tab, then
                // request to activate that tab. When the tab panel is mounted,
                // the target will automatically update.

                if (typeof nextStep?.target === 'string') {
                    if (nextStep.target.startsWith('[itemId=pb-activities-explorer-')) {
                        setSelectedActivity(Activity.Explorer);
                    } else if (
                        nextStep.target.startsWith('[itemId=pb-activities-settings-')
                    ) {
                        setSelectedActivity(Activity.Settings);
                    }
                }

                setStepIndex(nextIndex);
            }
        },
        [
            dispatch,
            selectedActivity,
            setSelectedActivity,
            stepIndex,
            setStepIndex,
            steps,
        ],
    );

    // automatically show the tour on the first run only
    useEffectOnce(() => {
        if (showOnStartup) {
            setSelectedActivity(Activity.Settings);
            dispatch(tourStart());
            setShowOnStartup(false);
        }
    });

    return (
        <Joyride
            run={isRunning}
            stepIndex={stepIndex}
            continuous={true}
            showProgress={true}
            steps={steps}
            styles={styles}
            locale={locale}
            callback={callback}
        />
    );
};

export default Tour;
