// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { AnyAction } from 'redux';
import { Epic, combineEpics, ofType } from 'redux-observable';
import { map } from 'rxjs/operators';
import { BLEConnectActionType, BLEDataAction, BLEDataActionType } from '../actions/ble';
import { HubRuntimeStatusType, checksum, updateStatus } from '../actions/hub';
import { sendData } from '../actions/terminal';
import { RootState } from '../reducers';
import { HubRuntimeState } from '../reducers/hub';

const decoder = new TextDecoder();

const connect: Epic = (action$) =>
    action$.pipe(
        ofType(BLEConnectActionType.DidConnect),
        map(() => updateStatus(HubRuntimeStatusType.Idle)),
    );

const disconnect: Epic = (action$) =>
    action$.pipe(
        ofType(BLEConnectActionType.DidDisconnect),
        map(() => updateStatus(HubRuntimeStatusType.Disconnected)),
    );

const rxUartData: Epic<AnyAction, AnyAction, RootState> = (action$, state$) =>
    action$.pipe(
        ofType<AnyAction, BLEDataAction>(BLEDataActionType.Notify),
        map((a) => {
            if (
                state$.value.hub.runtime === HubRuntimeState.Loading &&
                a.value.buffer.byteLength === 1
            ) {
                const view = new DataView(a.value.buffer);
                return checksum(view.getUint8(0));
            } else {
                const value = decoder.decode(a.value.buffer);
                // FIXME: sometimes we get ERROR and IDLE in same message except
                // last E is cut off
                if (value.match(/>>>> IDLE/)) {
                    return updateStatus(HubRuntimeStatusType.Idle);
                }
                if (value.match(/>>>> ERROR/)) {
                    return updateStatus(HubRuntimeStatusType.Error);
                }
                if (value.match(/>>>> RUNNING/)) {
                    return updateStatus(HubRuntimeStatusType.Running);
                }
                return sendData(value);
            }
        }),
    );

export default combineEpics(connect, disconnect, rxUartData);
