// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Epic, combineEpics } from 'redux-observable';
import { catchError } from 'rxjs/operators';
import ble from './ble';

const rootEpic: Epic = (action$, store$, dependencies) =>
    combineEpics(ble)(action$, store$, dependencies).pipe(
        catchError((error, source) => {
            console.error(error);
            return source;
        }),
    );

export default rootEpic;
