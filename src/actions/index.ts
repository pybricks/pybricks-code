import { Dispatch as ReduxDispatch } from 'redux';
import {
    BootloaderAction,
    BootloaderConnectionAction,
    BootloaderDidRequestAction,
    BootloaderRequestAction,
    BootloaderResponseAction,
} from './bootloader';
import { EditorAction } from './editor';
import { NotificationAction } from './notification';
import { TerminalDataAction } from './terminal';

/**
 * Common type for all actions.
 */
export type Action =
    | BootloaderConnectionAction
    | BootloaderRequestAction
    | BootloaderDidRequestAction
    | BootloaderResponseAction
    | BootloaderAction
    | EditorAction
    | NotificationAction
    | TerminalDataAction;

/**
 * Dispatch function.
 */
export type Dispatch = ReduxDispatch<Action>;
