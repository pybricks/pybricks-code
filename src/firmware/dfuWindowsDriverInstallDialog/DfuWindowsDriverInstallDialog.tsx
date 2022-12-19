// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import './dfuWindowsDriverInstallDialog.scss';
import {
    Card,
    Classes,
    DialogStep,
    Elevation,
    MultistepDialog,
} from '@blueprintjs/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Hub } from '../../components/hubPicker';
import { useHubPickerSelectedHub } from '../../components/hubPicker/hooks';
import { useSelector } from '../../reducers';
import { firmwareDfuWindowsDriverInstallDialogDialogHide } from './actions';
import { useI18n } from './i18n';

const dfuWindows1OpenDeviceManagerUrl = new URL(
    '@pybricks/images/dfu_windows_1_open_device_manager.png',
    import.meta.url,
);
const dfuWindows2LargeHubOpenPropertiesUrl = new URL(
    '@pybricks/images/dfu_windows_2_large_hub_open_properties.png',
    import.meta.url,
);
const dfuWindows2SmallHubOpenPropertiesUrl = new URL(
    '@pybricks/images/dfu_windows_2_small_hub_open_properties.png',
    import.meta.url,
);
const dfuWindows3LargeHubPropertiesUrl = new URL(
    '@pybricks/images/dfu_windows_3_large_hub_properties.png',
    import.meta.url,
);
const dfuWindows3SmallHubPropertiesUrl = new URL(
    '@pybricks/images/dfu_windows_3_small_hub_properties.png',
    import.meta.url,
);
const dfuWindows4LargeHubUpdateDriverUrl = new URL(
    '@pybricks/images/dfu_windows_4_large_hub_update_driver.png',
    import.meta.url,
);
const dfuWindows4SmallHubUpdateDriverUrl = new URL(
    '@pybricks/images/dfu_windows_4_small_hub_update_driver.png',
    import.meta.url,
);
const dfuWindows5LargeHubUpdateDriverPickUrl = new URL(
    '@pybricks/images/dfu_windows_5_large_hub_update_driver_pick.png',
    import.meta.url,
);
const dfuWindows5SmallHubUpdateDriverPickUrl = new URL(
    '@pybricks/images/dfu_windows_5_small_hub_update_driver_pick.png',
    import.meta.url,
);
const dfuWindows6LargeHubUpdateDriverSelectTypeUrl = new URL(
    '@pybricks/images/dfu_windows_6_large_hub_update_driver_select_type.png',
    import.meta.url,
);
const dfuWindows6SmallHubUpdateDriverSelectTypeUrl = new URL(
    '@pybricks/images/dfu_windows_6_small_hub_update_driver_select_type.png',
    import.meta.url,
);
const dfuWindows7LargeHubUpdateDriverSelectDriverUrl = new URL(
    '@pybricks/images/dfu_windows_7_large_hub_update_driver_select_driver.png',
    import.meta.url,
);
const dfuWindows7SmallHubUpdateDriverSelectDriverUrl = new URL(
    '@pybricks/images/dfu_windows_7_small_hub_update_driver_select_driver.png',
    import.meta.url,
);
const dfuWindows8UpdateDriverWarningUrl = new URL(
    '@pybricks/images/dfu_windows_8_update_driver_warning.png',
    import.meta.url,
);
const dfuWindows9LargeHubUpdateDriverDoneUrl = new URL(
    '@pybricks/images/dfu_windows_9_large_hub_update_driver_done.png',
    import.meta.url,
);
const dfuWindows9SmallHubUpdateDriverDoneUrl = new URL(
    '@pybricks/images/dfu_windows_9_small_hub_update_driver_done.png',
    import.meta.url,
);

// These names are hard-coded in the hub bootloader, so they don't get translated
const dfuSmallHubUsbName = 'LEGO Technic Small Hub in DFU Mode';
const dfuLargeHubUsbName = 'LEGO Technic Large Hub in DFU Mode';

type ScreenshotProps = {
    url: URL;
};

const Screenshot: React.VoidFunctionComponent<ScreenshotProps> = ({ url }) => {
    return (
        <Card elevation={Elevation.FOUR}>
            <img src={url.toString()} alt="Screenshot" width={673} height={523} />
        </Card>
    );
};

type HubTypeProps = {
    hub: Hub;
};

const Step1: React.VoidFunctionComponent = () => {
    const i18n = useI18n();

    return (
        <div className={Classes.DIALOG_BODY}>
            <Screenshot url={dfuWindows1OpenDeviceManagerUrl} />
            <div className="pb-spacer" />
            <div className={Classes.RUNNING_TEXT}>
                <p>
                    {i18n.translate('step.1.message', {
                        startMenu: <em>{i18n.translate('step.1.startMenu')}</em>,
                        deviceManager: (
                            <em>{i18n.translate('step.1.deviceManager')}</em>
                        ),
                    })}
                </p>
            </div>
        </div>
    );
};

const Step2: React.VoidFunctionComponent<HubTypeProps> = ({ hub }) => {
    const i18n = useI18n();

    return (
        <div className={Classes.DIALOG_BODY}>
            <Screenshot
                url={
                    hub === Hub.Essential
                        ? dfuWindows2SmallHubOpenPropertiesUrl
                        : dfuWindows2LargeHubOpenPropertiesUrl
                }
            />
            <div className="pb-spacer" />
            <div className={Classes.RUNNING_TEXT}>
                <p>
                    {i18n.translate('step.2.message', {
                        dfuUsbHubName: (
                            <em>
                                {hub === Hub.Essential
                                    ? dfuSmallHubUsbName
                                    : dfuLargeHubUsbName}
                            </em>
                        ),
                        otherDevices: <em>{i18n.translate('step.2.otherDevices')}</em>,
                        properties: <em>{i18n.translate('step.2.properties')}</em>,
                    })}
                </p>
            </div>
        </div>
    );
};

const Step3: React.VoidFunctionComponent<HubTypeProps> = ({ hub }) => {
    const i18n = useI18n();

    return (
        <div className={Classes.DIALOG_BODY}>
            <Screenshot
                url={
                    hub === Hub.Essential
                        ? dfuWindows3SmallHubPropertiesUrl
                        : dfuWindows3LargeHubPropertiesUrl
                }
            />
            <div className="pb-spacer" />
            <div className={Classes.RUNNING_TEXT}>
                <p>
                    {i18n.translate('step.3.message', {
                        properties: (
                            <em>
                                {i18n.translate('step.3.properties', {
                                    dfuUsbHubName: (
                                        <em>
                                            {hub === Hub.Essential
                                                ? dfuSmallHubUsbName
                                                : dfuLargeHubUsbName}
                                        </em>
                                    ),
                                })}
                            </em>
                        ),
                        updateDriver: <em>{i18n.translate('step.3.updateDriver')}</em>,
                    })}
                </p>
            </div>
        </div>
    );
};

const Step4: React.VoidFunctionComponent<HubTypeProps> = ({ hub }) => {
    const i18n = useI18n();

    return (
        <div className={Classes.DIALOG_BODY}>
            <Screenshot
                url={
                    hub === Hub.Essential
                        ? dfuWindows4SmallHubUpdateDriverUrl
                        : dfuWindows4LargeHubUpdateDriverUrl
                }
            />
            <div className="pb-spacer" />
            <div className={Classes.RUNNING_TEXT}>
                <p>
                    {i18n.translate('step.4.message', {
                        updateDrivers: (
                            <em>{i18n.translate('step.4.updateDrivers')}</em>
                        ),
                        browse: <em>{i18n.translate('step.4.browse')}</em>,
                    })}
                </p>
            </div>
        </div>
    );
};

const Step5: React.VoidFunctionComponent<HubTypeProps> = ({ hub }) => {
    const i18n = useI18n();

    return (
        <div className={Classes.DIALOG_BODY}>
            <Screenshot
                url={
                    hub === Hub.Essential
                        ? dfuWindows5SmallHubUpdateDriverPickUrl
                        : dfuWindows5LargeHubUpdateDriverPickUrl
                }
            />
            <div className="pb-spacer" />
            <div className={Classes.RUNNING_TEXT}>
                <p>
                    {i18n.translate('step.5.message', {
                        letMePick: <em>{i18n.translate('step.5.letMePick')}</em>,
                    })}
                </p>
            </div>
        </div>
    );
};

const Step6: React.VoidFunctionComponent<HubTypeProps> = ({ hub }) => {
    const i18n = useI18n();

    return (
        <div className={Classes.DIALOG_BODY}>
            <Screenshot
                url={
                    hub === Hub.Essential
                        ? dfuWindows6SmallHubUpdateDriverSelectTypeUrl
                        : dfuWindows6LargeHubUpdateDriverSelectTypeUrl
                }
            />
            <div className="pb-spacer" />
            <div className={Classes.RUNNING_TEXT}>
                <p>
                    {i18n.translate('step.6.message', {
                        usbDevices: <em>{i18n.translate('step.6.usbDevices')}</em>,
                        next: <em>{i18n.translate('step.6.next')}</em>,
                    })}
                </p>
            </div>
        </div>
    );
};

const Step7: React.VoidFunctionComponent<HubTypeProps> = ({ hub }) => {
    const i18n = useI18n();

    return (
        <div className={Classes.DIALOG_BODY}>
            <Screenshot
                url={
                    hub === Hub.Essential
                        ? dfuWindows7SmallHubUpdateDriverSelectDriverUrl
                        : dfuWindows7LargeHubUpdateDriverSelectDriverUrl
                }
            />
            <div className="pb-spacer" />
            <div className={Classes.RUNNING_TEXT}>
                <p>
                    {i18n.translate('step.7.message', {
                        manufacturer: <em>{i18n.translate('step.7.manufacturer')}</em>,
                        winUsbDevice: <em>{i18n.translate('step.7.winUsbDevice')}</em>,
                        model: <em>{i18n.translate('step.7.model')}</em>,
                        next: <em>{i18n.translate('step.7.next')}</em>,
                    })}
                </p>
            </div>
        </div>
    );
};

const Step8: React.VoidFunctionComponent = () => {
    const i18n = useI18n();

    return (
        <div className={Classes.DIALOG_BODY}>
            <Screenshot url={dfuWindows8UpdateDriverWarningUrl} />
            <div className="pb-spacer" />
            <div className={Classes.RUNNING_TEXT}>
                <p>
                    {i18n.translate('step.8.message', {
                        yes: <em>{i18n.translate('step.8.yes')}</em>,
                    })}
                </p>
            </div>
        </div>
    );
};

const Step9: React.VoidFunctionComponent<HubTypeProps> = ({ hub }) => {
    const i18n = useI18n();

    return (
        <div className={Classes.DIALOG_BODY}>
            <Screenshot
                url={
                    hub === Hub.Essential
                        ? dfuWindows9SmallHubUpdateDriverDoneUrl
                        : dfuWindows9LargeHubUpdateDriverDoneUrl
                }
            />
            <div className="pb-spacer" />
            <div className={Classes.RUNNING_TEXT}>
                <p>
                    {i18n.translate('step.9.message', {
                        close: <em>{i18n.translate('step.9.close')}</em>,
                    })}
                </p>
            </div>
        </div>
    );
};

const DfuWindowsDriverInstallDialog: React.VoidFunctionComponent = () => {
    const [hub] = useHubPickerSelectedHub();
    const { isOpen } = useSelector((s) => s.firmware.dfuWindowsDriverInstallDialog);
    const dispatch = useDispatch();
    const i18n = useI18n();

    return (
        <MultistepDialog
            title={i18n.translate('title')}
            className="pb-dfu-windows-driver-install-dialog"
            isOpen={isOpen}
            onClose={() => dispatch(firmwareDfuWindowsDriverInstallDialogDialogHide())}
            finalButtonProps={{
                text: i18n.translate('doneButton.label'),
                onClick: () =>
                    dispatch(firmwareDfuWindowsDriverInstallDialogDialogHide()),
            }}
        >
            <DialogStep
                id="1"
                panel={<Step1 />}
                nextButtonProps={{ text: i18n.translate('nextButton.label') }}
            />
            <DialogStep
                id="2"
                panel={<Step2 hub={hub} />}
                nextButtonProps={{ text: i18n.translate('nextButton.label') }}
            />
            <DialogStep
                id="3"
                panel={<Step3 hub={hub} />}
                nextButtonProps={{ text: i18n.translate('nextButton.label') }}
            />
            <DialogStep
                id="4"
                panel={<Step4 hub={hub} />}
                nextButtonProps={{ text: i18n.translate('nextButton.label') }}
            />
            <DialogStep
                id="5"
                panel={<Step5 hub={hub} />}
                nextButtonProps={{ text: i18n.translate('nextButton.label') }}
            />
            <DialogStep
                id="6"
                panel={<Step6 hub={hub} />}
                nextButtonProps={{ text: i18n.translate('nextButton.label') }}
            />
            <DialogStep
                id="7"
                panel={<Step7 hub={hub} />}
                nextButtonProps={{ text: i18n.translate('nextButton.label') }}
            />
            <DialogStep
                id="8"
                panel={<Step8 />}
                nextButtonProps={{ text: i18n.translate('nextButton.label') }}
            />
            <DialogStep
                id="9"
                panel={<Step9 hub={hub} />}
                nextButtonProps={{ text: i18n.translate('nextButton.label') }}
            />
        </MultistepDialog>
    );
};

export default DfuWindowsDriverInstallDialog;
