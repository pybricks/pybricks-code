// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Action } from 'redux';
import { PnpId } from './protocol';

export enum BleDIServiceActionType {
    DidReceiveFirmwareRevision = 'action.bleDIService.didReceiveFirmwareRevision',
    DidReceiveSoftwareRevision = 'action.bleDIService.didReceiveSoftwareRevision',
    DidReceivePnPId = 'action.bleDIService.didReceivePnPId',
}

/** Action that indicates the firmware revision characteristic was read. */
export type BleDIServiceDidReceiveFirmwareRevisionAction =
    Action<BleDIServiceActionType.DidReceiveFirmwareRevision> & {
        version: string;
    };

/** Action that indicates the firmware revision characteristic was read. */
export function bleDIServiceDidReceiveFirmwareRevision(
    version: string,
): BleDIServiceDidReceiveFirmwareRevisionAction {
    return { type: BleDIServiceActionType.DidReceiveFirmwareRevision, version };
}

/** Action that indicates the software revision characteristic was read. */
export type BleDIServiceDidReceiveSoftwareRevisionAction =
    Action<BleDIServiceActionType.DidReceiveSoftwareRevision> & {
        version: string;
    };

/** Action that indicates the software revision characteristic was read. */
export function bleDIServiceDidReceiveSoftwareRevision(
    version: string,
): BleDIServiceDidReceiveSoftwareRevisionAction {
    return { type: BleDIServiceActionType.DidReceiveSoftwareRevision, version };
}

/** Action that indicates the PnP ID characteristic was read. */
export type BleDIServiceDidReceivePnPIdAction =
    Action<BleDIServiceActionType.DidReceivePnPId> & {
        pnpId: PnpId;
    };

/** Action that indicates the PnP ID characteristic was read. */
export function bleDIServiceDidReceivePnPId(
    pnpId: PnpId,
): BleDIServiceDidReceivePnPIdAction {
    return { type: BleDIServiceActionType.DidReceivePnPId, pnpId };
}

/** Common type for all device info service actions. */
export type BleDIServiceAction =
    | BleDIServiceDidReceiveFirmwareRevisionAction
    | BleDIServiceDidReceiveSoftwareRevisionAction
    | BleDIServiceDidReceivePnPIdAction;
