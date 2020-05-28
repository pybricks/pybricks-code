import { runSaga, stdChannel } from 'redux-saga';
import { Action } from '../actions';
import {
    MpyActionType,
    MpyDidCompileAction,
    MpyDidFailToCompileAction,
    compile,
} from '../actions/mpy';
import mpy from './mpy';

enum MpyFeatureFlags {
    MICROPY_OPT_CACHE_MAP_LOOKUP_IN_BYTECODE = 1 << 0,
    MICROPY_PY_BUILTINS_STR_UNICODE = 1 << 1,
}

test('compiler works', async () => {
    const channel = stdChannel();
    const dispatched = new Array<Action>();
    const task = runSaga(
        {
            channel,
            dispatch: (action: Action) => dispatched.push(action),
        },
        mpy,
    );
    channel.put(compile('print("hello!")'));

    // TODO: not sure what the best way to handle this is. We could just wait
    // for one dispatch, but then we could miss a bug where there is more than
    // one dispatch. And if we make the time too short, we could get intermittent
    // failures.
    setTimeout(() => task.cancel(), 1000);
    await task.toPromise();

    expect(dispatched.length).toBe(1);
    expect(dispatched[0].type).toBe(MpyActionType.DidCompile);
    const { data } = dispatched[0] as MpyDidCompileAction;
    expect(data[0]).toBe('M'.charCodeAt(0));
    expect(data[1]).toBe(4); // ABI version
    expect(data[2]).toBe(MpyFeatureFlags.MICROPY_PY_BUILTINS_STR_UNICODE);
    expect(data[3]).toBe(31); // small int bits
});

test('compiler error works', async () => {
    const channel = stdChannel();
    const dispatched = new Array<Action>();
    const task = runSaga(
        {
            channel,
            dispatch: (action: Action) => dispatched.push(action),
        },
        mpy,
    );
    channel.put(compile('syntax error!'));

    // TODO: not sure what the best way to handle this is. We could just wait
    // for one dispatch, but then we could miss a bug where there is more than
    // one dispatch. And if we make the time too short, we could get intermittent
    // failures.
    setTimeout(() => task.cancel(), 1000);
    await task.toPromise();

    expect(dispatched.length).toBe(1);
    expect(dispatched[0].type).toBe(MpyActionType.DidFailToCompile);
    const { err } = dispatched[0] as MpyDidFailToCompileAction;
    expect(err).toContain('SyntaxError');
});
