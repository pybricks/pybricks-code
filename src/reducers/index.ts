import { combineReducers } from 'redux';
import ble, { BLEState } from './ble';
import editor, { EditorState } from './editor';
import hub, { HubState } from './hub';

/**
 * Root state for redux store.
 */
export interface RootState {
    readonly ble: BLEState;
    readonly editor: EditorState;
    readonly hub: HubState;
}

export default combineReducers({ ble, editor, hub });
