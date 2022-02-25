// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { AsyncSaga } from '../../test';
import { createCountFunc } from '../utils/iter';
import {
    checksumRequest,
    checksumResponse,
    didError,
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
} from './actions';
import { Command, HubType, ProtectionLevel, ProtocolError, Result } from './protocol';
import bootloader from './sagas';

describe('message encoder', () => {
    test.each([
        [
            'erase',
            eraseRequest(0, /* isCityHub */ false),
            [
                0x11, // erase command
            ],
        ],
        [
            'program',
            programRequest(
                1,
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
            rebootRequest(2),
            [
                0x33, // reboot command
            ],
        ],
        [
            'init',
            initRequest(3, 100000),
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
            infoRequest(4),
            [
                0x55, // info command
            ],
        ],
        [
            'checksum',
            checksumRequest(5),
            [
                0x66, // checksum command
            ],
        ],
        [
            'state',
            stateRequest(6),
            [
                0x77, // state command
            ],
        ],
        [
            'disconnect',
            disconnectRequest(7),
            [
                0x88, // disconnect command
            ],
        ],
    ])('encode %s request', async (_n, request, expected) => {
        const messageTypesThatShouldBeCalledWithoutResponse = [
            eraseRequest.toString(),
            programRequest.toString(),
            rebootRequest.toString(),
            disconnectRequest.toString(),
        ];
        const saga = new AsyncSaga(bootloader);
        saga.put(request);
        const message = new Uint8Array(expected);
        const action = await saga.take();
        expect(action).toEqual(
            send(
                message,
                !messageTypesThatShouldBeCalledWithoutResponse.includes(request.type),
            ),
        );
        await saga.end();
    });

    test('requests are serialized', async () => {
        const saga = new AsyncSaga(bootloader);

        // we send 4 requests
        saga.put(checksumRequest(0));
        saga.put(checksumRequest(1));
        saga.put(checksumRequest(2));
        saga.put(checksumRequest(3));

        // but only two didSend action meaning only the first two completed
        saga.put(didSend());
        saga.put(didSend());

        // So only 3 requests were actually sent and two didRequests were
        // dispatched (making 5 total dispatches). The last request is still
        // buffered and has not been dispatched.
        const numPending = saga.numPending();
        expect(numPending).toEqual(5);

        const message = new Uint8Array([Command.GetChecksum]);
        const nextId = createCountFunc();

        // every other action is the "send" action
        // and the interleaving actions are "did request" actions
        const action0 = await saga.take();
        expect(action0).toEqual(send(message, /* withResponse */ true));
        const action1 = await saga.take();
        expect(action1).toEqual(didRequest(nextId()));
        const action2 = await saga.take();
        expect(action2).toEqual(send(message, /* withResponse */ true));
        const action3 = await saga.take();
        expect(action3).toEqual(didRequest(nextId()));
        const action4 = await saga.take();
        expect(action4).toEqual(send(message, /* withResponse */ true));

        await saga.end();
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
        const saga = new AsyncSaga(bootloader);
        const response = new Uint8Array(message);

        saga.put(didReceive(new DataView(response.buffer)));

        const action = await saga.take();
        expect(action).toEqual(expected);

        await saga.end();
    });

    test.each([
        [
            'bad error bytecode',
            [
                0x05, // length
                0x00, // unused (hub id)
                0x04, // **invalid message type**
                0x77, // get flash state command
                0x05, // command not recognized
            ],
            didError(
                new ProtocolError(
                    'expecting error bytecode 0x05 but got 0x04',
                    new DataView(new Uint8Array().buffer),
                ),
            ),
        ],
        [
            'unknown error code',
            [
                0x05, // length
                0x00, // unused (hub id)
                0x05, // flash loader error message
                0x77, // get flash state command
                0x04, // **invalid error code**
            ],
            didError(
                new ProtocolError(
                    'unknown error code: 0x04',
                    new DataView(new Uint8Array().buffer),
                ),
            ),
        ],
        [
            'unknown response',
            [
                0x00, // **bad command**
                0x01, // **junk**
                0x02, // **junk**
                0x03, // **junk**
                0x04, // **junk**
            ],
            didError(
                new ProtocolError(
                    'unknown bootloader response type: 0x00',
                    new DataView(new Uint8Array().buffer),
                ),
            ),
        ],
    ])('protocol error', async (_n, message, expected) => {
        const saga = new AsyncSaga(bootloader);
        const response = new Uint8Array(message);

        saga.put(didReceive(new DataView(response.buffer)));

        const action = await saga.take();
        expect(action).toEqual(expected);

        await saga.end();
    });
});
