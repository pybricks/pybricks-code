import { combineEpics, Epic } from 'redux-observable';
import { catchError } from 'rxjs/operators';
import ble from './ble';
import terminal from './terminal';

const rootEpic: Epic = (action$, store$, dependencies) =>
    combineEpics(ble, terminal)(action$, store$, dependencies).pipe(
        catchError((error, source) => {
            console.error(error);
            return source;
        }),
    );

export default rootEpic;
