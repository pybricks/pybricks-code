import { combineEpics, Epic, ofType } from 'redux-observable';
import { BLEDataActionType, BLEDataAction } from '../actions/ble';
import { map } from 'rxjs/operators';
import { TerminalDataAction, sendData } from '../actions/terminal';

const decoder = new TextDecoder();

const rxUartData: Epic = (action$) =>
    action$.pipe(
        ofType(BLEDataActionType.ReceivedData),
        map(
            (a: BLEDataAction): TerminalDataAction =>
                sendData(decoder.decode(a.value.buffer)),
        ),
    );

export default combineEpics(rxUartData);
