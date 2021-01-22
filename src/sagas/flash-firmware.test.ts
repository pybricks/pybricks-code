// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import {
    FirmwareMetadata,
    FirmwareReaderError,
    FirmwareReaderErrorCode,
} from '@pybricks/firmware';
import JSZip from 'jszip';
import { AsyncSaga } from '../../test';
import {
    FailToFinishReasonType,
    HubError,
    MetadataProblem,
    didFailToFinish,
    didFinish,
    didProgress,
    didStart,
    flashFirmware as flashFirmwareAction,
} from '../actions/flash-firmware';
import {
    BootloaderConnectionFailureReason,
    BootloaderProgramRequestAction,
    checksumRequest,
    checksumResponse,
    connect,
    didConnect,
    didDisconnect,
    didFailToConnect,
    didRequest,
    disconnect,
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
} from '../actions/lwp3-bootloader';
import { didCompile, didFailToCompile } from '../actions/mpy';
import { Command, HubType, Result } from '../protocols/lwp3-bootloader';
import { BootloaderConnectionState } from '../reducers/bootloader';
import { createCountFunc } from '../utils/iter';
import flashFirmware from './flash-firmware';

afterEach(() => {
    jest.restoreAllMocks();
});

describe('flashFirmware', () => {
    describe('normal flow', () => {
        test('success', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                'checksum-type': 'sum',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1024,
                'mpy-abi-version': 5,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            zip.file('firmware-base.bin', new Uint8Array(64));
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            jest.spyOn(window, 'fetch').mockResolvedValueOnce(
                new Response(await zip.generateAsync({ type: 'blob' })),
            );

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(flashFirmwareAction());

            // first step is to connect to the hub bootloader

            let action = await saga.take();
            expect(action).toEqual(connect());

            saga.updateState({
                bootloader: { connection: BootloaderConnectionState.Connected },
            });
            saga.put(didConnect());

            // then find out what kind of hub it is

            action = await saga.take();
            expect(action).toEqual(infoRequest(0));

            saga.put(didRequest(0));
            saga.put(infoResponse(0x01000000, 0x08005000, 0x081f800, HubType.MoveHub));

            // then compile main.py to .mpy

            action = await saga.take();
            expect(action).toMatchInlineSnapshot(`
                Object {
                  "options": Array [
                    "-mno-unicode",
                  ],
                  "script": "print(\\"test\\")",
                  "type": "mpy.action.compile",
                }
            `);

            const mpySize = 20;
            const mpyBinaryData = new Uint8Array(mpySize);
            saga.put(didCompile(mpyBinaryData));

            // then start flashing the firmware

            // should get didStart action just before starting to erase
            action = await saga.take();
            expect(action).toEqual(didStart());

            // erase first

            action = await saga.take();
            expect(action).toEqual(eraseRequest(1));

            saga.put(didRequest(1));
            saga.put(eraseResponse(Result.OK));

            // then write the new firmware

            const totalFirmwareSize = metadata['user-mpy-offset'] + mpySize + 8;
            action = await saga.take();
            expect(action).toEqual(initRequest(2, totalFirmwareSize));

            saga.put(didRequest(2));
            saga.put(initResponse(Result.OK));

            const dummyPayload = new ArrayBuffer(0);
            let id = 2;
            for (let count = 1, offset = 0; ; count++, offset += 14) {
                action = await saga.take();
                expect(action).toEqual(
                    programRequest(++id, 0x08005000 + offset, dummyPayload),
                );
                expect(
                    (action as BootloaderProgramRequestAction).payload.byteLength,
                ).toBe(Math.min(14, totalFirmwareSize - offset));

                saga.put(didRequest(id));

                action = await saga.take();
                expect(action).toEqual(didProgress(offset / totalFirmwareSize));

                // Have to be careful that a checksum request is not sent after
                // last payload is sent, otherwise the hub gets confused.

                if (offset + 14 >= totalFirmwareSize) {
                    break;
                }

                if (count % 10 === 0) {
                    action = await saga.take();
                    expect(action).toEqual(checksumRequest(++id));

                    saga.put(didRequest(id));
                    saga.put(checksumResponse(0));
                }
            }

            // hub indicates success

            saga.put(programResponse(0, totalFirmwareSize));

            action = await saga.take();
            expect(action).toEqual(didProgress(1));

            // and finally reboot the hub

            action = await saga.take();
            expect(action).toEqual(rebootRequest(++id));

            saga.put(didRequest(id));

            // then we are done

            action = await saga.take();
            expect(action).toEqual(didFinish());

            await saga.end();
        });

        test('fail to connect', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                'checksum-type': 'sum',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1024,
                'mpy-abi-version': 5,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            zip.file('firmware-base.bin', new Uint8Array(64));
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            jest.spyOn(window, 'fetch').mockResolvedValueOnce(
                new Response(await zip.generateAsync({ type: 'blob' })),
            );

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(flashFirmwareAction());

            // first step is to connect to the hub bootloader

            let action = await saga.take();
            expect(action).toEqual(connect());

            saga.put(
                didFailToConnect(BootloaderConnectionFailureReason.GattServiceNotFound),
            );

            // it should fail here because of failure to connect

            action = await saga.take();
            expect(action).toEqual(
                didFailToFinish(FailToFinishReasonType.FailedToConnect),
            );

            await saga.end();
        });

        test('untimely disconnect before start cancels saga', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                'checksum-type': 'sum',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1024,
                'mpy-abi-version': 5,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            zip.file('firmware-base.bin', new Uint8Array(64));
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            jest.spyOn(window, 'fetch').mockResolvedValueOnce(
                new Response(await zip.generateAsync({ type: 'blob' })),
            );

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(flashFirmwareAction());

            // first step is to connect to the hub bootloader

            let action = await saga.take();
            expect(action).toEqual(connect());

            saga.updateState({
                bootloader: { connection: BootloaderConnectionState.Connected },
            });
            saga.put(didConnect());

            // then find out what kind of hub it is

            action = await saga.take();
            expect(action).toEqual(infoRequest(0));

            saga.put(didRequest(0));

            // hub disconnects before replying

            saga.updateState({
                bootloader: { connection: BootloaderConnectionState.Disconnected },
            });
            saga.put(didDisconnect());

            // should get a failure to start

            action = await saga.take();
            expect(action).toEqual(
                didFailToFinish(FailToFinishReasonType.Disconnected),
            );

            await saga.end();
        });

        test('fail to send info request', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                'checksum-type': 'sum',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1024,
                'mpy-abi-version': 5,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            zip.file('firmware-base.bin', new Uint8Array(64));
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            jest.spyOn(window, 'fetch').mockResolvedValueOnce(
                new Response(await zip.generateAsync({ type: 'blob' })),
            );

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(flashFirmwareAction());

            // first step is to connect to the hub bootloader

            let action = await saga.take();
            expect(action).toEqual(connect());

            saga.updateState({
                bootloader: { connection: BootloaderConnectionState.Connected },
            });
            saga.put(didConnect());

            // then find out what kind of hub it is

            action = await saga.take();
            expect(action).toEqual(infoRequest(0));

            const testError = new Error('test');
            saga.put(didRequest(0, testError));

            // should get a failure to start

            action = await saga.take();
            expect(action).toEqual(
                didFailToFinish(FailToFinishReasonType.BleError, testError),
            );

            // should request to disconnect after failure

            action = await saga.take();
            expect(action).toEqual(disconnect());

            await saga.end();
        });

        test('info request is unknown command', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                'checksum-type': 'sum',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1024,
                'mpy-abi-version': 5,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            zip.file('firmware-base.bin', new Uint8Array(64));
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            jest.spyOn(window, 'fetch').mockResolvedValueOnce(
                new Response(await zip.generateAsync({ type: 'blob' })),
            );

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(flashFirmwareAction());

            // first step is to connect to the hub bootloader

            let action = await saga.take();
            expect(action).toEqual(connect());

            saga.updateState({
                bootloader: { connection: BootloaderConnectionState.Connected },
            });
            saga.put(didConnect());

            // then find out what kind of hub it is

            action = await saga.take();
            expect(action).toEqual(infoRequest(0));

            saga.put(didRequest(0));
            saga.put(errorResponse(Command.GetInfo));

            // should get an unknown command failure

            action = await saga.take();
            expect(action).toEqual(
                didFailToFinish(
                    FailToFinishReasonType.HubError,
                    HubError.UnknownCommand,
                ),
            );

            // should request to disconnect after failure

            action = await saga.take();
            expect(action).toEqual(disconnect());

            await saga.end();
        });

        test('timeout waiting for info response', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                'checksum-type': 'sum',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1024,
                'mpy-abi-version': 5,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            zip.file('firmware-base.bin', new Uint8Array(64));
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            jest.spyOn(window, 'fetch').mockResolvedValueOnce(
                new Response(await zip.generateAsync({ type: 'blob' })),
            );

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(flashFirmwareAction());

            // first step is to connect to the hub bootloader

            let action = await saga.take();
            expect(action).toEqual(connect());

            saga.updateState({
                bootloader: { connection: BootloaderConnectionState.Connected },
            });
            saga.put(didConnect());

            // then find out what kind of hub it is

            action = await saga.take();
            expect(action).toEqual(infoRequest(0));

            saga.put(didRequest(0));

            // should get a timed-out failure

            action = await saga.take();
            expect(action).toEqual(didFailToFinish(FailToFinishReasonType.TimedOut));

            // should request to disconnect after failure

            action = await saga.take();
            expect(action).toEqual(disconnect());

            await saga.end();
        });

        test('unsupported device', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                'checksum-type': 'sum',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1024,
                'mpy-abi-version': 5,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            zip.file('firmware-base.bin', new Uint8Array(64));
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            jest.spyOn(window, 'fetch').mockResolvedValueOnce(
                new Response(await zip.generateAsync({ type: 'blob' })),
            );

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(flashFirmwareAction());

            // first step is to connect to the hub bootloader

            let action = await saga.take();
            expect(action).toEqual(connect());

            saga.updateState({
                bootloader: { connection: BootloaderConnectionState.Connected },
            });
            saga.put(didConnect());

            // then find out what kind of hub it is

            action = await saga.take();
            expect(action).toEqual(infoRequest(0));

            // received an unknown hub type ID

            saga.put(didRequest(0));
            saga.put(infoResponse(0x01000000, 0x08005000, 0x081f800, 0 as HubType));

            // should raise an error that we don't have any firmware for this hub

            action = await saga.take();
            expect(action).toStrictEqual(
                didFailToFinish(FailToFinishReasonType.NoFirmware),
            );

            // should request to disconnect after failure

            action = await saga.take();
            expect(action).toEqual(disconnect());

            await saga.end();
        });

        test('erase response is failed', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                'checksum-type': 'sum',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1024,
                'mpy-abi-version': 5,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            zip.file('firmware-base.bin', new Uint8Array(64));
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            jest.spyOn(window, 'fetch').mockResolvedValueOnce(
                new Response(await zip.generateAsync({ type: 'blob' })),
            );

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(flashFirmwareAction());

            // first step is to connect to the hub bootloader

            let action = await saga.take();
            expect(action).toEqual(connect());

            saga.updateState({
                bootloader: { connection: BootloaderConnectionState.Connected },
            });
            saga.put(didConnect());

            // then find out what kind of hub it is

            action = await saga.take();
            expect(action).toEqual(infoRequest(0));

            saga.put(didRequest(0));
            saga.put(infoResponse(0x01000000, 0x08005000, 0x081f800, HubType.MoveHub));

            // then compile main.py to .mpy

            action = await saga.take();
            expect(action).toMatchInlineSnapshot(`
                Object {
                  "options": Array [
                    "-mno-unicode",
                  ],
                  "script": "print(\\"test\\")",
                  "type": "mpy.action.compile",
                }
            `);

            const mpySize = 20;
            const mpyBinaryData = new Uint8Array(mpySize);
            saga.put(didCompile(mpyBinaryData));

            // then start flashing the firmware

            // should get didStart action just before starting to erase
            action = await saga.take();
            expect(action).toEqual(didStart());

            // erase first

            action = await saga.take();
            expect(action).toEqual(eraseRequest(1));

            saga.put(didRequest(1));
            saga.put(eraseResponse(Result.Error));

            // should get a hub error

            action = await saga.take();
            expect(action).toEqual(
                didFailToFinish(FailToFinishReasonType.HubError, HubError.EraseFailed),
            );

            // should request to disconnect after failure

            action = await saga.take();
            expect(action).toEqual(disconnect());

            await saga.end();
        });
    });

    describe('user supplied firmware.zip', () => {
        test('success', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                'checksum-type': 'sum',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1024,
                'mpy-abi-version': 5,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            zip.file('firmware-base.bin', new Uint8Array(64));
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(
                flashFirmwareAction(await zip.generateAsync({ type: 'arraybuffer' })),
            );

            // the first step is to compile main.py to .mpy

            let action = await saga.take();
            expect(action).toMatchInlineSnapshot(`
                Object {
                  "options": Array [
                    "-mno-unicode",
                  ],
                  "script": "print(\\"test\\")",
                  "type": "mpy.action.compile",
                }
            `);

            const mpySize = 20;
            const mpyBinaryData = new Uint8Array(mpySize);
            saga.put(didCompile(mpyBinaryData));

            // then connect to the hub bootloader

            action = await saga.take();
            expect(action).toEqual(connect());

            saga.updateState({
                bootloader: { connection: BootloaderConnectionState.Connected },
            });
            saga.put(didConnect());

            // then find out what kind of hub it is

            action = await saga.take();
            expect(action).toEqual(infoRequest(0));

            saga.put(didRequest(0));
            saga.put(infoResponse(0x01000000, 0x08005000, 0x081f800, HubType.MoveHub));

            // then start flashing the firmware

            // should get didStart action just before starting to erase
            action = await saga.take();
            expect(action).toEqual(didStart());

            // erase first

            action = await saga.take();
            expect(action).toEqual(eraseRequest(1));

            saga.put(didRequest(1));
            saga.put(eraseResponse(Result.OK));

            // then write the new firmware

            const totalFirmwareSize = metadata['user-mpy-offset'] + mpySize + 8;
            action = await saga.take();
            expect(action).toEqual(initRequest(2, totalFirmwareSize));

            saga.put(didRequest(2));
            saga.put(initResponse(Result.OK));

            const dummyPayload = new ArrayBuffer(0);
            let id = 2;
            for (let count = 1, offset = 0; ; count++, offset += 14) {
                action = await saga.take();
                expect(action).toEqual(
                    programRequest(++id, 0x08005000 + offset, dummyPayload),
                );
                expect(
                    (action as BootloaderProgramRequestAction).payload.byteLength,
                ).toBe(Math.min(14, totalFirmwareSize - offset));

                saga.put(didRequest(id));

                action = await saga.take();
                expect(action).toEqual(didProgress(offset / totalFirmwareSize));

                // Have to be careful that a checksum request is not sent after
                // last payload is sent, otherwise the hub gets confused.

                if (offset + 14 >= totalFirmwareSize) {
                    break;
                }

                if (count % 10 === 0) {
                    action = await saga.take();
                    expect(action).toEqual(checksumRequest(++id));

                    saga.put(didRequest(id));
                    saga.put(checksumResponse(0));
                }
            }

            // hub indicates success

            saga.put(programResponse(0, totalFirmwareSize));

            action = await saga.take();
            expect(action).toEqual(didProgress(1));

            // and finally reboot the hub

            action = await saga.take();
            expect(action).toEqual(rebootRequest(++id));

            saga.put(didRequest(id));

            // then we are done

            action = await saga.take();
            expect(action).toEqual(didFinish());

            await saga.end();
        });

        test('zip error', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                'checksum-type': 'sum',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1024,
                'mpy-abi-version': 5,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            // no firmware-base.bin - triggers zip error
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(
                flashFirmwareAction(await zip.generateAsync({ type: 'arraybuffer' })),
            );

            // should get failure due to missing file

            const action = await saga.take();
            expect(action).toStrictEqual(
                didFailToFinish(
                    FailToFinishReasonType.ZipError,
                    new FirmwareReaderError(
                        FirmwareReaderErrorCode.MissingFirmwareBaseBin,
                    ),
                ),
            );

            await saga.end();
        });

        test('unsupported mpy-cross version', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                'checksum-type': 'sum',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1024,
                'mpy-abi-version': 4, // unsupported version
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            zip.file('firmware-base.bin', new Uint8Array(64));
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(
                flashFirmwareAction(await zip.generateAsync({ type: 'arraybuffer' })),
            );

            // should get failure due to unsupported mpy-cross version

            const action = await saga.take();
            expect(action).toStrictEqual(
                didFailToFinish(
                    FailToFinishReasonType.BadMetadata,
                    'mpy-abi-version',
                    MetadataProblem.NotSupported,
                ),
            );

            await saga.end();
        });

        test('compile error', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                'checksum-type': 'sum',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1024,
                'mpy-abi-version': 5,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            zip.file('firmware-base.bin', new Uint8Array(64));
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(
                flashFirmwareAction(await zip.generateAsync({ type: 'arraybuffer' })),
            );

            // the first step is to compile main.py to .mpy

            let action = await saga.take();
            expect(action).toMatchInlineSnapshot(`
                Object {
                  "options": Array [
                    "-mno-unicode",
                  ],
                  "script": "print(\\"test\\")",
                  "type": "mpy.action.compile",
                }
            `);

            // this triggers a failure

            saga.put(didFailToCompile(['test']));

            // compiler error should trigger firmware flash failure

            action = await saga.take();
            expect(action).toEqual(
                didFailToFinish(FailToFinishReasonType.FailedToCompile),
            );

            await saga.end();
        });

        test('firmware too big', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                'checksum-type': 'sum',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1, // low limit to trigger error
                'mpy-abi-version': 5,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            zip.file('firmware-base.bin', new Uint8Array(64));
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(
                flashFirmwareAction(await zip.generateAsync({ type: 'arraybuffer' })),
            );

            // the first step is to compile main.py to .mpy

            let action = await saga.take();
            expect(action).toMatchInlineSnapshot(`
                Object {
                  "options": Array [
                    "-mno-unicode",
                  ],
                  "script": "print(\\"test\\")",
                  "type": "mpy.action.compile",
                }
            `);

            const mpySize = 20;
            const mpyBinaryData = new Uint8Array(mpySize);
            saga.put(didCompile(mpyBinaryData));

            // should fail due to firmware being too big

            action = await saga.take();
            expect(action).toEqual(
                didFailToFinish(FailToFinishReasonType.FirmwareSize),
            );

            await saga.end();
        });

        test('bad checksum algorithm', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                // @ts-expect-error: testing bad value
                'checksum-type': 'bad',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1024,
                'mpy-abi-version': 5,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            zip.file('firmware-base.bin', new Uint8Array(64));
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(
                flashFirmwareAction(await zip.generateAsync({ type: 'arraybuffer' })),
            );

            // the first step is to compile main.py to .mpy

            let action = await saga.take();
            expect(action).toMatchInlineSnapshot(`
                Object {
                  "options": Array [
                    "-mno-unicode",
                  ],
                  "script": "print(\\"test\\")",
                  "type": "mpy.action.compile",
                }
            `);

            const mpySize = 20;
            const mpyBinaryData = new Uint8Array(mpySize);
            saga.put(didCompile(mpyBinaryData));

            // should fail due to bad checksum algorithm

            action = await saga.take();
            expect(action).toEqual(
                didFailToFinish(
                    FailToFinishReasonType.BadMetadata,
                    'checksum-type',
                    MetadataProblem.NotSupported,
                ),
            );

            await saga.end();
        });

        test('connected device type does not match firmware device type', async () => {
            const metadata: FirmwareMetadata = {
                'metadata-version': '1.0.0',
                'device-id': HubType.MoveHub,
                'checksum-type': 'sum',
                'firmware-version': '1.2.3',
                'max-firmware-size': 1024,
                'mpy-abi-version': 5,
                'mpy-cross-options': ['-mno-unicode'],
                'user-mpy-offset': 100,
            };

            const zip = new JSZip();
            zip.file('firmware-base.bin', new Uint8Array(64));
            zip.file('firmware.metadata.json', JSON.stringify(metadata));
            zip.file('main.py', 'print("test")');
            zip.file('ReadMe_OSS.txt', 'test');

            const saga = new AsyncSaga(
                flashFirmware,
                {
                    bootloader: { connection: BootloaderConnectionState.Disconnected },
                    settings: { flashCurrentProgram: false },
                },
                {
                    nextMessageId: createCountFunc(),
                },
            );

            // saga is triggered by this action

            saga.put(
                flashFirmwareAction(await zip.generateAsync({ type: 'arraybuffer' })),
            );

            // the first step is to compile main.py to .mpy

            let action = await saga.take();
            expect(action).toMatchInlineSnapshot(`
                Object {
                  "options": Array [
                    "-mno-unicode",
                  ],
                  "script": "print(\\"test\\")",
                  "type": "mpy.action.compile",
                }
            `);

            const mpySize = 20;
            const mpyBinaryData = new Uint8Array(mpySize);
            saga.put(didCompile(mpyBinaryData));

            // then connect to the hub bootloader

            action = await saga.take();
            expect(action).toEqual(connect());

            saga.updateState({
                bootloader: { connection: BootloaderConnectionState.Connected },
            });
            saga.put(didConnect());

            // then find out what kind of hub it is

            action = await saga.take();
            expect(action).toEqual(infoRequest(0));

            // connected hub type does not match firmware hub type
            saga.put(didRequest(0));
            saga.put(infoResponse(0x01000000, 0x08005000, 0x081f800, HubType.CityHub));

            // should raise an error that we don't have any firmware for this hub

            action = await saga.take();
            expect(action).toStrictEqual(
                didFailToFinish(FailToFinishReasonType.DeviceMismatch),
            );

            // should request to disconnect after failure

            action = await saga.take();
            expect(action).toEqual(disconnect());

            await saga.end();
        });
    });

    test('user supplied main.py', async () => {
        const metadata: FirmwareMetadata = {
            'metadata-version': '1.0.0',
            'device-id': HubType.MoveHub,
            'checksum-type': 'sum',
            'firmware-version': '1.2.3',
            'max-firmware-size': 1024,
            'mpy-abi-version': 5,
            'mpy-cross-options': ['-mno-unicode'],
            'user-mpy-offset': 100,
        };

        const zip = new JSZip();
        zip.file('firmware-base.bin', new Uint8Array(64));
        zip.file('firmware.metadata.json', JSON.stringify(metadata));
        zip.file('main.py', 'print("test")');
        zip.file('ReadMe_OSS.txt', 'test');

        jest.spyOn(window, 'fetch').mockResolvedValueOnce(
            new Response(await zip.generateAsync({ type: 'blob' })),
        );

        const editor = {
            getValue: () => 'print("test")',
        };

        const saga = new AsyncSaga(
            flashFirmware,
            {
                bootloader: { connection: BootloaderConnectionState.Disconnected },
                editor: { current: editor },
                settings: { flashCurrentProgram: true },
            },
            { nextMessageId: createCountFunc() },
        );

        // saga is triggered by this action

        saga.put(flashFirmwareAction());

        // first step is to connect to the hub bootloader

        let action = await saga.take();
        expect(action).toEqual(connect());

        saga.updateState({
            bootloader: { connection: BootloaderConnectionState.Connected },
        });
        saga.put(didConnect());

        // then find out what kind of hub it is

        action = await saga.take();
        expect(action).toEqual(infoRequest(0));

        saga.put(didRequest(0));
        saga.put(infoResponse(0x01000000, 0x08005000, 0x081f800, HubType.MoveHub));

        // then compile main.py to .mpy

        action = await saga.take();
        expect(action).toMatchInlineSnapshot(`
            Object {
              "options": Array [
                "-mno-unicode",
              ],
              "script": "print(\\"test\\")",
              "type": "mpy.action.compile",
            }
        `);

        const mpySize = 20;
        const mpyBinaryData = new Uint8Array(mpySize);
        saga.put(didCompile(mpyBinaryData));

        // then start flashing the firmware

        // should get didStart action just before starting to erase
        action = await saga.take();
        expect(action).toEqual(didStart());

        // erase first

        action = await saga.take();
        expect(action).toEqual(eraseRequest(1));

        saga.put(didRequest(1));
        saga.put(eraseResponse(Result.OK));

        // then write the new firmware

        const totalFirmwareSize = metadata['user-mpy-offset'] + mpySize + 8;
        action = await saga.take();
        expect(action).toEqual(initRequest(2, totalFirmwareSize));

        saga.put(didRequest(2));
        saga.put(initResponse(Result.OK));

        const dummyPayload = new ArrayBuffer(0);
        let id = 2;
        for (let count = 1, offset = 0; ; count++, offset += 14) {
            action = await saga.take();
            expect(action).toEqual(
                programRequest(++id, 0x08005000 + offset, dummyPayload),
            );
            expect((action as BootloaderProgramRequestAction).payload.byteLength).toBe(
                Math.min(14, totalFirmwareSize - offset),
            );

            saga.put(didRequest(id));

            action = await saga.take();
            expect(action).toEqual(didProgress(offset / totalFirmwareSize));

            // Have to be careful that a checksum request is not sent after
            // last payload is sent, otherwise the hub gets confused.

            if (offset + 14 >= totalFirmwareSize) {
                break;
            }

            if (count % 10 === 0) {
                action = await saga.take();
                expect(action).toEqual(checksumRequest(++id));

                saga.put(didRequest(id));
                saga.put(checksumResponse(0));
            }
        }

        // hub indicates success

        saga.put(programResponse(0, totalFirmwareSize));

        action = await saga.take();
        expect(action).toEqual(didProgress(1));

        // and finally reboot the hub

        action = await saga.take();
        expect(action).toEqual(rebootRequest(++id));

        saga.put(didRequest(id));

        // then we are done

        action = await saga.take();
        expect(action).toEqual(didFinish());

        await saga.end();
    });
});
