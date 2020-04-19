import { combineReducers } from 'redux';
import ble, { BLEState } from './ble';
import bootloader, { BootloaderState } from './bootloader';
import editor, { EditorState } from './editor';
import hub, { HubState } from './hub';

/**
 * Root state for redux store.
 */
export interface RootState {
    readonly bootloader: BootloaderState;
    readonly ble: BLEState;
    readonly editor: EditorState;
    readonly hub: HubState;
}

export default combineReducers({ bootloader, ble, editor, hub });
