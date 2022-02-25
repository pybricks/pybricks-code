// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { createAction } from '../actions';
import { PnpId } from './protocol';

/** Action that indicates the firmware revision characteristic was read. */
export const bleDIServiceDidReceiveFirmwareRevision = createAction(
    (version: string) => ({
        type: 'action.bleDIService.didReceiveFirmwareRevision',
        version,
    }),
);

/** Action that indicates the software revision characteristic was read. */
export const bleDIServiceDidReceiveSoftwareRevision = createAction(
    (version: string) => ({
        type: 'action.bleDIService.didReceiveSoftwareRevision',
        version,
    }),
);

/** Action that indicates the PnP ID characteristic was read. */
export const bleDIServiceDidReceivePnPId = createAction((pnpId: PnpId) => ({
    type: 'action.bleDIService.didReceivePnPId',
    pnpId,
}));
