// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { AnyAction } from 'redux';
import { Epic, combineEpics, ofType } from 'redux-observable';
import { Subject } from 'rxjs';
import { ignoreElements, take, tap } from 'rxjs/operators';
import { HubChecksumMessageAction, HubMessageActionType } from '../actions/hub';

const checksumSubject = new Subject<number>();

const checksum: Epic = (action$) =>
    action$.pipe(
        ofType<AnyAction, HubChecksumMessageAction>(HubMessageActionType.Checksum),
        tap((a) => checksumSubject.next(a.checksum)),
        ignoreElements(),
    );

export function getChecksum(): Promise<number> {
    return checksumSubject.pipe(take(1)).toPromise();
}

export default combineEpics(checksum);
