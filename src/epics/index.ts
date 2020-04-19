import { Epic, combineEpics } from 'redux-observable';
import { catchError } from 'rxjs/operators';
import ble from './ble';
import hub from './hub';
import terminal from './terminal';

const rootEpic: Epic = (action$, store$, dependencies) =>
    combineEpics(ble, hub, terminal)(action$, store$, dependencies).pipe(
        catchError((error, source) => {
            console.error(error);
            return source;
        }),
    );

export default rootEpic;
