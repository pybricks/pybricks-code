// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

// Definitions for compile-time UI settings.

/** Time in milliseconds before showing tooltip popover. */
export const tooltipDelay = 1000;

/** Official name of the app. */
export const appName = process.env.REACT_APP_NAME || 'REACT_APP_NAME is undefined';

/** The version of the app (without the "v" prefix). */
export const appVersion =
    process.env.REACT_APP_VERSION || 'REACT_APP_VERSION is undefined';

/** URL to Pybricks Code changelog. */
export const changelogUrl =
    'https://github.com/pybricks/pybricks-code/blob/master/CHANGELOG.md';

/** URL to main Pybricks website. */
export const pybricksWebsiteUrl = 'https://pybricks.com';

/** URL to Pybricks support site. */
export const pybricksSupportUrl = 'https://github.com/pybricks/support/discussions';

/** URL to Pybricks projects site. */
export const pybricksProjectsUrl = 'https://pybricks.com/projects/';

/** URL to Pybricks bug report site. */
export const pybricksBugReportsUrl = 'https://github.com/pybricks/support/issues';

/** URL for Pybricks community chat on Gitter */
export const pybricksGitterUrl = 'https://gitter.im/pybricks/community';

export const pybricksBluetoothTroubleshootingUrl =
    'https://github.com/pybricks/support/discussions/270';

export const pybricksUsbDfuTroubleshootingUrl =
    'https://github.com/pybricks/support/discussions/688';

export const pybricksUsbDfuWindowsDriverInstallUrl =
    'https://github.com/pybricks/support/discussions/688#discussioncomment-3201466';

export const pybricksUsbLinuxUdevRulesUrl =
    'https://github.com/pybricks/support/discussions/688#discussioncomment-3239099';

export const pybricksBleFirmwareRestoreVideoUrl =
    'https://pybricks.com/install/technic-boost-city/#restoring-the-original-firmware';

export const pybricksDfuRestoreUrl = 'https://dfu.pybricks.com';

/** Pybricks copyright statement. */
export const pybricksCopyright = 'Copyright (c) 2020-2022 The Pybricks Authors';

// https://www.lego.com/en-us/legal/notices-and-policies/fair-play/
/** LEGO "fair play" disclaimer */
export const legoDisclaimer =
    'LEGO® is a trademark of the LEGO Group of companies which does not sponsor, authorize or endorse this site.';
