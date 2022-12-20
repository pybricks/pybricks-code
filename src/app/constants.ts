// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors
import docsPackage from '@pybricks/ide-docs/package.json';

// Definitions for compile-time UI settings.

/** The official Pybricks blue color. */
export const pybricksBlue = '#0088ce';

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

/** URL to Pybricks team page. */
export const pybricksTeamUrl = 'https://pybricks.com/about/#the-pybricks-team';

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

export const pybricksUsbLinuxUdevRulesUrl =
    'https://pybricks.com/projects/tutorials/dev/tools/linux/';

/** Pybricks copyright statement. */
export const pybricksCopyright = 'Copyright (c) 2020-2023 The Pybricks Authors';

/** The LEGO name with registered trademark symbol. */
export const legoRegisteredTrademark = 'LEGO®';

/** The LEGO Education SPIKE name with registered trademark symbol. */
export const legoEducationSpikeRegisteredTrademark = 'LEGO® Education™ SPIKE™';

/** The LEGO MINDSTORMS name with registered trademark symbol. */
export const legoMindstormsRegisteredTrademark = 'LEGO® MINDSTORMS®';

// https://www.lego.com/en-us/legal/notices-and-policies/fair-play/
/** LEGO "fair play" disclaimer */
export const legoDisclaimer =
    'LEGO® is a trademark of the LEGO Group of companies which does not sponsor, authorize or endorse this site.';

/**
 * Provides a version for the required headers of this app.
 *
 * This is used for cache bursting when the required headers change.
 *
 * Currently, the following headers are required:
 *      Cross-Origin-Opener-Policy: same-origin
 *      Cross-Origin-Embedder-Policy: require-corp
 */
export const httpServerHeadersVersion = 2;

/** Path to directory where docs are copied by webpack. */
export const docsPathPrefix = `static/docs/v${docsPackage.version}/`;

/** The index page of the docs. */
export const docsDefaultPage = `${docsPathPrefix}index.html`;
