import { AnyAction } from 'redux';
import { Epic, combineEpics, ofType } from 'redux-observable';
import { Subject } from 'rxjs';
import { ignoreElements, take, tap } from 'rxjs/operators';
import { HubActionType, HubChecksumAction } from '../actions/hub';

const checksumSubject = new Subject<number>();

const checksum: Epic = (action$) =>
    action$.pipe(
        ofType<AnyAction, HubChecksumAction>(HubActionType.Checksum),
        tap((a) => checksumSubject.next(a.checksum)),
        ignoreElements(),
    );

export function getChecksum(): Promise<number> {
    return checksumSubject.pipe(take(1)).toPromise();
}

export default combineEpics(checksum);
