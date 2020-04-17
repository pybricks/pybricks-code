import { combineEpics, Epic, ofType } from 'redux-observable';
import { write, BLEThunkAction } from '../actions/ble';
import { Subject } from 'rxjs';
import { map, tap, ignoreElements } from 'rxjs/operators';
import { TerminalDataAction, TerminalDataActionType } from '../actions/terminal';

const encoder = new TextEncoder();

const terminalOutputSubject = new Subject<string>();
export const terminalOutput = terminalOutputSubject.asObservable();

// When terminal has focus this receives the input. All input is sent over BLE connection.
const receiveTerminalData: Epic = (action$) =>
    action$.pipe(
        ofType(TerminalDataActionType.ReceivedData),
        map((a: TerminalDataAction): BLEThunkAction => write(encoder.encode(a.value))),
    );

// Request to write to the terminal are handled by an observable rather than
// using redux state.
const sendTerminalData: Epic = (action$) =>
    action$.pipe(
        ofType(TerminalDataActionType.SendData),
        tap((a: TerminalDataAction): void => terminalOutputSubject.next(a.value)),
        ignoreElements(),
    );

export default combineEpics(receiveTerminalData, sendTerminalData);
