import { Action } from 'redux';
import { runSaga, stdChannel } from 'redux-saga';
import {
    BootloaderChecksumRequestAction,
    BootloaderChecksumResponseAction,
    BootloaderConnectionActionType,
    BootloaderDisconnectRequestAction,
    BootloaderEraseRequestAction,
    BootloaderEraseResponseAction,
    BootloaderErrorResponseAction,
    BootloaderInfoRequestAction,
    BootloaderInfoResponseAction,
    BootloaderInitRequestAction,
    BootloaderInitResponseAction,
    BootloaderProgramRequestAction,
    BootloaderProgramResponseAction,
    BootloaderRebootRequestAction,
    BootloaderRequestActionType,
    BootloaderResponseActionType,
    BootloaderStateRequestAction,
    BootloaderStateResponseAction,
    didReceive,
    didSend,
    eraseRequest,
} from '../actions/bootloader';
import { Command, HubType, ProtectionLevel, Result } from '../protocols/bootloader';
import bootloader from './bootloader';

describe('message encoder', () => {
    test.each([
        [
            'erase',
            {
                type: BootloaderRequestActionType.Erase,
            } as BootloaderEraseRequestAction,
            [
                0x11, // erase command
            ],
        ],
        [
            'program',
            {
                type: BootloaderRequestActionType.Program,
                address: 0x08005000,
                payload: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
                    .buffer,
            } as BootloaderProgramRequestAction,
            [
                0x22, // program command
                0x12, // message size (payload size + 4)
                0x00, // offset LSB
                0x50, // .
                0x00, // .
                0x08, // offset MSB
                0x01, // payload[0]
                0x02, // payload[1]
                0x03, // payload[2]
                0x04, // payload[3]
                0x05, // payload[4]
                0x06, // payload[5]
                0x07, // payload[6]
                0x08, // payload[7]
                0x09, // payload[8]
                0x0a, // payload[9]
                0x0b, // payload[10]
                0x0c, // payload[11]
                0x0d, // payload[12]
                0x0e, // payload[13]
            ],
        ],
        [
            'reboot',
            {
                type: BootloaderRequestActionType.Reboot,
            } as BootloaderRebootRequestAction,
            [
                0x33, // reboot command
            ],
        ],
        [
            'init',
            {
                type: BootloaderRequestActionType.Init,
                firmwareSize: 100000,
            } as BootloaderInitRequestAction,
            [
                0x44, // init command
                0xa0, // size LSB
                0x86, // .
                0x01, // .
                0x00, // size MSB
            ],
        ],
        [
            'info',
            {
                type: BootloaderRequestActionType.Info,
            } as BootloaderInfoRequestAction,
            [
                0x55, // info command
            ],
        ],
        [
            'checksum',
            {
                type: BootloaderRequestActionType.Checksum,
            } as BootloaderChecksumRequestAction,
            [
                0x66, // checksum command
            ],
        ],
        [
            'state',
            {
                type: BootloaderRequestActionType.State,
            } as BootloaderStateRequestAction,
            [
                0x77, // state command
            ],
        ],
        [
            'disconnect',
            {
                type: BootloaderRequestActionType.Disconnect,
            } as BootloaderDisconnectRequestAction,
            [
                0x88, // disconnect command
            ],
        ],
    ])('encode %s request', async (_n, request, expected) => {
        const channel = stdChannel();
        const dispatched = new Array<Action>();
        const task = runSaga(
            {
                channel,
                dispatch: (action: Action) => dispatched.push(action),
            },
            bootloader,
        );
        channel.put(request);
        task.cancel();
        await task.toPromise();
        const message = new Uint8Array(expected);
        expect(dispatched[0]).toEqual({
            type: BootloaderConnectionActionType.Send,
            data: message,
            withResponse: false,
        });
    });

    test('requests are serialized', async () => {
        const channel = stdChannel();
        const dispatched = new Array<Action>();
        const task = runSaga(
            {
                channel,
                dispatch: (action: Action) => dispatched.push(action),
            },
            bootloader,
        );

        // we send 4 requests
        channel.put(eraseRequest());
        channel.put(eraseRequest());
        channel.put(eraseRequest());
        channel.put(eraseRequest());

        // but only one didSend action meaning only the first one completed
        channel.put(didSend());

        task.cancel();
        await task.toPromise();

        // so only 2 messages were actually sent and 2 are still waiting for
        // the second one to complete
        expect(dispatched.length).toEqual(2);
        const message = new Uint8Array([Command.EraseFlash]);
        for (const d of dispatched) {
            expect(d).toEqual({
                type: BootloaderConnectionActionType.Send,
                data: message,
                withResponse: false,
            });
        }
    });
});

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
            } as BootloaderEraseResponseAction,
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
            } as BootloaderProgramResponseAction,
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
            } as BootloaderInitResponseAction,
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
            } as BootloaderInfoResponseAction,
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
            } as BootloaderChecksumResponseAction,
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
            } as BootloaderStateResponseAction,
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
            } as BootloaderErrorResponseAction,
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
