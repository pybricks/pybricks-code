import { Action } from 'redux';
import { runSaga, stdChannel } from 'redux-saga';
import { BootloaderResponseActionType, didReceive } from '../actions/bootloader';
import { Command, HubType, ProtectionLevel, Result } from '../protocols/bootloader';
import bootloader from './bootloader';

describe('message decoder', () => {
    test.each([
        [
            'erase',
            [
                0x11, // erase command
                0xff, // success
            ],
            {
                type: BootloaderResponseActionType.Erase,
                result: Result.Error,
            },
        ],
        [
            'flash',
            [
                0x22, // flash command
                0xaa, // checksum
                0xa0, // byte count LSB
                0x86, // .
                0x01, // .
                0x00, // byte count MSB
            ],
            {
                type: BootloaderResponseActionType.Program,
                checksum: 0xaa,
                count: 100000,
            },
        ],
        [
            'init',
            [
                0x44, // init command
                0xff, // success
            ],
            {
                type: BootloaderResponseActionType.Init,
                result: Result.Error,
            },
        ],
        [
            'info',
            [
                0x55, // info command
                0x78, // version LSB
                0x56, // .
                0x34, // .
                0x12, // version MSB
                0x00, // start address LSB
                0x50, // .
                0x00, // .
                0x08, // start address MSB
                0xff, // end address LSB
                0xf7, // .
                0x01, // .
                0x08, // end address MSB
                0x40, // hub type ID
            ],
            {
                type: BootloaderResponseActionType.Info,
                version: 0x12345678,
                startAddress: 0x08005000,
                endAddress: 0x0801f7ff,
                hubType: HubType.MoveHub,
            },
        ],
        [
            'checksum',
            [
                0x66, // checksum command
                0xaa, // checksum
            ],
            {
                type: BootloaderResponseActionType.Checksum,
                checksum: 0xaa,
            },
        ],
        [
            'state',
            [
                0x77, // flash state command
                0x02, // protection level
            ],
            {
                type: BootloaderResponseActionType.State,
                level: ProtectionLevel.Level2,
            },
        ],
        [
            'error',
            [
                0x05, // length
                0x00, // unused (hub id)
                0x05, // flash loader error message
                0x77, // get flash state command
                0x05, // command not recognized
            ],
            {
                type: BootloaderResponseActionType.Error,
                command: Command.GetFlashState,
            },
        ],
    ])('decode %s response', async (_n, message, expected) => {
        const response = new Uint8Array(message);
        const channel = stdChannel();
        const dispatched = new Array<Action>();
        const task = runSaga(
            {
                channel,
                dispatch: (action: Action) => dispatched.push(action),
            },
            bootloader,
        );
        channel.put(didReceive(new DataView(response.buffer)));
        task.cancel();
        await task.toPromise();
        expect(dispatched[0]).toEqual(expected);
    });
});
