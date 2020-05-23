// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Action } from 'redux';
import { runSaga, stdChannel } from 'redux-saga';
import {
    BootloaderRequestActionType,
    checksumRequest,
    checksumResponse,
    didReceive,
    didRequest,
    didSend,
    disconnectRequest,
    eraseRequest,
    eraseResponse,
    errorResponse,
    infoRequest,
    infoResponse,
    initRequest,
    initResponse,
    programRequest,
    programResponse,
    rebootRequest,
    send,
    stateRequest,
    stateResponse,
} from '../actions/bootloader';
import { Command, HubType, ProtectionLevel, Result } from '../protocols/bootloader';
import { createCountFunc } from '../utils/iter';
import bootloader from './bootloader';

describe('message encoder', () => {
    test.each([
        [
            'erase',
            eraseRequest(),
            [
                0x11, // erase command
            ],
        ],
        [
            'program',
            programRequest(
                0x08005000,
                new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]).buffer,
            ),
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
            rebootRequest(),
            [
                0x33, // reboot command
            ],
        ],
        [
            'init',
            initRequest(100000),
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
            infoRequest(),
            [
                0x55, // info command
            ],
        ],
        [
            'checksum',
            checksumRequest(),
            [
                0x66, // checksum command
            ],
        ],
        [
            'state',
            stateRequest(),
            [
                0x77, // state command
            ],
        ],
        [
            'disconnect',
            disconnectRequest(),
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
        expect(dispatched[0]).toEqual(
            send(
                message,
                /* withResponse */ request.type !== BootloaderRequestActionType.Program,
            ),
        );
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
        channel.put({ ...eraseRequest(), id: 0 });
        channel.put({ ...eraseRequest(), id: 1 });
        channel.put({ ...eraseRequest(), id: 2 });
        channel.put({ ...eraseRequest(), id: 3 });

        // but only two didSend action meaning only the first two completed
        channel.put(didSend());
        channel.put(didSend());

        task.cancel();
        await task.toPromise();

        // So only 3 requests were actually sent and two didRequests were
        // dispatched (making 5 total dispatches). The last request is still
        // buffered and has not been dispatched.
        expect(dispatched.length).toEqual(5);

        // every other action is the "send" action
        const message = new Uint8Array([Command.EraseFlash]);
        for (let i = 0; i < dispatched.length; i += 2) {
            expect(dispatched[i]).toEqual(send(message, /* withResponse */ true));
        }

        // and the interleaving actions are "did request" actions
        const nextId = createCountFunc();
        for (let i = 1; i < dispatched.length; i += 2) {
            expect(dispatched[i]).toEqual(didRequest(nextId()));
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
            eraseResponse(Result.Error),
        ],
        [
            'program',
            [
                0x22, // flash command
                0xaa, // checksum
                0xa0, // byte count LSB
                0x86, // .
                0x01, // .
                0x00, // byte count MSB
            ],
            programResponse(0xaa, 100000),
        ],
        [
            'init',
            [
                0x44, // init command
                0xff, // success
            ],
            initResponse(Result.Error),
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
            infoResponse(0x12345678, 0x08005000, 0x0801f7ff, HubType.MoveHub),
        ],
        [
            'checksum',
            [
                0x66, // checksum command
                0xaa, // checksum
            ],
            checksumResponse(0xaa),
        ],
        [
            'state',
            [
                0x77, // flash state command
                0x02, // protection level
            ],
            stateResponse(ProtectionLevel.Level2),
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
            errorResponse(Command.GetFlashState),
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
