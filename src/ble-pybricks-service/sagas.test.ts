// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { AsyncSaga } from '../../test';
import {
    didFailToSendCommand,
    didFailToWriteCommand,
    didNotifyEvent,
    didReceiveStatusReport,
    didSendCommand,
    didWriteCommand,
    eventProtocolError,
    sendStopUserProgramCommand,
    writeCommand,
} from './actions';
import { CommandType, ProtocolError } from './protocol';
import blePybricksService from './sagas';

describe('command encoder', () => {
    test.each([
        [
            'stop user program',
            sendStopUserProgramCommand(0),
            [
                0x00, // stop user program command
            ],
        ],
    ])('encode %s request', async (_n, request, expected) => {
        const saga = new AsyncSaga(blePybricksService);
        saga.put(request);
        const message = new Uint8Array(expected);
        const action = await saga.take();
        expect(action).toEqual(writeCommand(0, message));
        await saga.end();
    });

    test('commands are serialized', async () => {
        const saga = new AsyncSaga(blePybricksService);

        // we send 4 commands
        saga.put(sendStopUserProgramCommand(0));
        saga.put(sendStopUserProgramCommand(1));
        saga.put(sendStopUserProgramCommand(2));
        saga.put(sendStopUserProgramCommand(3));

        // but only two didSendCommand actions meaning only the first two completed
        saga.put(didWriteCommand(0));
        saga.put(didWriteCommand(1));

        // So only 3 commands were actually sent and two didSendCommand were
        // dispatched (making 5 total dispatches). The last request is still
        // buffered and has not been dispatched.
        const numPending = saga.numPending();
        expect(numPending).toEqual(5);

        const message = new Uint8Array([CommandType.StopUserProgram]);

        // every other action is the "write command" action
        // and the interleaving actions are "did send command" actions
        const action0 = await saga.take();
        expect(action0).toEqual(writeCommand(0, message));
        const action1 = await saga.take();
        expect(action1).toEqual(didSendCommand(0));
        const action2 = await saga.take();
        expect(action2).toEqual(writeCommand(1, message));
        const action3 = await saga.take();
        expect(action3).toEqual(didSendCommand(1));
        const action4 = await saga.take();
        expect(action4).toEqual(writeCommand(2, message));

        await saga.end();
    });

    test('fail to send triggers fail to write', async () => {
        const saga = new AsyncSaga(blePybricksService);

        saga.put(sendStopUserProgramCommand(0));

        const message = new Uint8Array([0x00]);
        const action1 = await saga.take();
        expect(action1).toEqual(writeCommand(0, message));

        const err = new Error('test error');
        saga.put(didFailToWriteCommand(0, err));

        const action2 = await saga.take();
        expect(action2).toEqual(didFailToSendCommand(0, err));

        await saga.end();
    });
});

describe('event decoder', () => {
    test.each([
        [
            'status report',
            [
                0x00, // status report event
                0x01, // flags count LSB
                0x00, // .
                0x00, // .
                0x00, // flags count MSB
            ],
            didReceiveStatusReport(0x00000001),
        ],
    ])('decode %s event', async (_n, message, expected) => {
        const saga = new AsyncSaga(blePybricksService);
        const notification = new Uint8Array(message);

        saga.put(didNotifyEvent(new DataView(notification.buffer)));

        const action = await saga.take();
        expect(action).toEqual(expected);

        await saga.end();
    });

    test.each([
        [
            'unknown event',
            [
                0xff, // **bad event**
                0x01, // **junk**
                0x02, // **junk**
                0x03, // **junk**
                0x04, // **junk**
            ],
            eventProtocolError(
                new ProtocolError(
                    'unknown pybricks event type: 0xff',
                    new DataView(new Uint8Array().buffer),
                ),
            ),
        ],
    ])('protocol error', async (_n, message, expected) => {
        const saga = new AsyncSaga(blePybricksService);
        const notification = new Uint8Array(message);

        saga.put(didNotifyEvent(new DataView(notification.buffer)));

        const action = await saga.take();
        expect(action).toEqual(expected);

        await saga.end();
    });
});
