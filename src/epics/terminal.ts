import { AnyAction } from 'redux';
import { Epic, combineEpics, ofType } from 'redux-observable';
import { Subject } from 'rxjs';
import { ignoreElements, map, tap } from 'rxjs/operators';
import { write } from '../actions/ble';
import { TerminalDataAction, TerminalDataActionType } from '../actions/terminal';

const encoder = new TextEncoder();

const terminalOutputSubject = new Subject<string>();
export const terminalOutput = terminalOutputSubject.asObservable();

// When terminal has focus this receives the input. All input is sent over BLE connection.
const receiveTerminalData: Epic = (action$) =>
    action$.pipe(
        ofType<AnyAction, TerminalDataAction>(TerminalDataActionType.ReceivedData),
        map((a) => write(encoder.encode(a.value))),
    );

// Request to write to the terminal are handled by an observable rather than
// using redux state.
const sendTerminalData: Epic = (action$) =>
    action$.pipe(
        ofType<AnyAction, TerminalDataAction>(TerminalDataActionType.SendData),
        tap((a) => terminalOutputSubject.next(a.value)),
        ignoreElements(),
    );

export default combineEpics(receiveTerminalData, sendTerminalData);
