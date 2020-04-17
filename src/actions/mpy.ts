import MpyCross from '@pybricks/mpy-cross';
import { Action } from 'redux';

// this starts the mpy-cross wasm runtime and leaves it running in the background
const mpy = MpyCross({ arguments: ['-mno-unicode'] });

enum MpyActionType {
    Compiled = 'mpy.action.compile',
}

interface MpyCompiledAction extends Action<MpyActionType.Compiled> {
    /**
     * The compiled .mpy data.
     */
    data: Uint8Array;
}

export function compile(script: string): MpyCompiledAction {
    // TODO: figure out how to capture stderr and emit error action on failure
    const data = mpy.compile(script);
    return { type: MpyActionType.Compiled, data };
}
