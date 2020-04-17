import { combineReducers } from 'redux';
import ble, { BLEState } from './ble';

/**
 * Root state for redux store.
 */
export interface RootState {
    readonly ble: BLEState;
}

export default combineReducers({ ble });
