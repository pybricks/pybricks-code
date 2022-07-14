// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { HubType } from '@pybricks/firmware';
import { MockProxy, mock } from 'jest-mock-extended';
import { AsyncSaga } from '../../test';
import {
    bleDIServiceDidReceiveFirmwareRevision,
    bleDIServiceDidReceivePnPId,
    bleDIServiceDidReceiveSoftwareRevision,
} from '../ble-device-info-service/actions';
import {
    serviceUUID as deviceInfoServiceUUID,
    firmwareRevisionStringUUID,
    pnpIdUUID,
    softwareRevisionStringUUID,
} from '../ble-device-info-service/protocol';
import { encodeInfo } from '../ble-device-info-service/protocol.test';
import {
    RxCharUUID as uartRxCharUUID,
    ServiceUUID as uartServiceUUID,
    TxCharUUID as uartTxCharUUID,
} from '../ble-nordic-uart-service/protocol';
import {
    ControlCharacteristicUUID as pybricksCommandCharacteristicUUID,
    ServiceUUID as pybricksServiceUUID,
} from '../ble-pybricks-service/protocol';
import {
    BleDeviceFailToConnectReasonType,
    connect,
    didConnect,
    didFailToConnect,
} from './actions';
import ble from './sagas';

const encoder = new TextEncoder();

afterEach(() => {
    jest.clearAllMocks();
});

describe('connect action is dispatched', () => {
    let saga: AsyncSaga;

    beforeEach(() => {
        saga = new AsyncSaga(ble);
    });

    it('should fail if no web bluetooth', async () => {
        saga.put(connect());

        await expect(saga.take()).resolves.toEqual(
            didFailToConnect({
                reason: BleDeviceFailToConnectReasonType.NoWebBluetooth,
            }),
        );
    });

    describe('has web bluetooth', () => {
        beforeEach(() => {
            navigator.bluetooth = mock<Bluetooth>();
        });

        it('should fail if bluetooth is not available', async () => {
            jest.spyOn(navigator.bluetooth, 'getAvailability').mockResolvedValue(false);
            saga.put(connect());

            await expect(saga.take()).resolves.toEqual(
                didFailToConnect({
                    reason: BleDeviceFailToConnectReasonType.NoBluetooth,
                }),
            );
        });

        describe('bluetooth is available', () => {
            beforeEach(() => {
                jest.spyOn(navigator.bluetooth, 'getAvailability').mockResolvedValue(
                    true,
                );
            });

            it('should fail if user canceled', async () => {
                jest.spyOn(navigator.bluetooth, 'requestDevice').mockRejectedValue(
                    new DOMException('test error', 'NotFoundError'),
                );
                saga.put(connect());

                await expect(saga.take()).resolves.toEqual(
                    didFailToConnect({
                        reason: BleDeviceFailToConnectReasonType.Canceled,
                    }),
                );
            });

            it('should fail on other exception', async () => {
                const testError = new DOMException('test error', 'SecurityError');
                jest.spyOn(navigator.bluetooth, 'requestDevice').mockRejectedValue(
                    testError,
                );
                saga.put(connect());

                await expect(saga.take()).resolves.toEqual(
                    didFailToConnect({
                        reason: BleDeviceFailToConnectReasonType.Unknown,
                        err: testError,
                    }),
                );
            });

            describe('device found', () => {
                let device: MockProxy<BluetoothDevice>;

                beforeEach(() => {
                    const deviceEvents = new EventTarget();

                    device = mock<BluetoothDevice>({
                        id: 'test-id',
                        name: 'test name',
                        gatt: undefined,
                        addEventListener: deviceEvents.addEventListener.bind(
                            deviceEvents,
                        ) as BluetoothDevice['addEventListener'],
                        removeEventListener:
                            deviceEvents.removeEventListener.bind(deviceEvents),
                        dispatchEvent: deviceEvents.dispatchEvent.bind(deviceEvents),
                    });

                    jest.spyOn(navigator.bluetooth, 'requestDevice').mockResolvedValue(
                        device,
                    );
                });

                it('should fail if no gatt', async () => {
                    saga.put(connect());

                    await expect(saga.take()).resolves.toEqual(
                        didFailToConnect({
                            reason: BleDeviceFailToConnectReasonType.NoGatt,
                        }),
                    );
                });

                describe('has gatt', () => {
                    let gatt: MockProxy<BluetoothRemoteGATTServer>;

                    beforeEach(() => {
                        gatt = mock<BluetoothRemoteGATTServer>();
                        Object.defineProperty(device, 'gatt', { value: gatt });
                    });

                    it('should fail if gatt connect fails', async () => {
                        const testError = new DOMException(
                            'test error',
                            'NetworkError',
                        );
                        gatt.connect.mockRejectedValue(testError);

                        saga.put(connect());

                        await expect(saga.take()).resolves.toEqual(
                            didFailToConnect({
                                reason: BleDeviceFailToConnectReasonType.Unknown,
                                err: testError,
                            }),
                        );
                    });

                    describe('gatt connect succeeded', () => {
                        beforeEach(() => {
                            gatt.connect.mockResolvedValue(gatt);
                            gatt.disconnect.mockImplementation(() => {
                                setTimeout(() => {
                                    device.dispatchEvent(
                                        new Event('gattserverdisconnected'),
                                    );
                                }, 10);
                            });
                        });

                        it('should fail if device does not have device info service', async () => {
                            const testError = new DOMException(
                                'test error',
                                'NotFoundError',
                            );
                            gatt.getPrimaryService.mockRejectedValue(testError);

                            saga.put(connect());

                            await expect(saga.take()).resolves.toEqual(
                                didFailToConnect({
                                    reason: BleDeviceFailToConnectReasonType.NoDeviceInfoService,
                                }),
                            );

                            expect(gatt.disconnect).toHaveBeenCalled();
                        });

                        describe('has device info service', () => {
                            let deviceInfoService: MockProxy<BluetoothRemoteGATTService>;

                            beforeEach(() => {
                                deviceInfoService = mock<BluetoothRemoteGATTService>();
                                gatt.getPrimaryService
                                    .calledWith(deviceInfoServiceUUID)
                                    .mockResolvedValue(deviceInfoService);
                            });

                            it('should fail if getting firmware version characteristic fails', async () => {
                                const testError = new Error('test error');
                                deviceInfoService.getCharacteristic.mockRejectedValue(
                                    testError,
                                );

                                saga.put(connect());

                                await expect(saga.take()).resolves.toEqual(
                                    didFailToConnect({
                                        reason: BleDeviceFailToConnectReasonType.Unknown,
                                        err: testError,
                                    }),
                                );

                                expect(gatt.disconnect).toHaveBeenCalled();
                            });

                            describe('has firmware version', () => {
                                let firmwareRevisionChar: MockProxy<BluetoothRemoteGATTCharacteristic>;
                                let softwareRevisionChar: MockProxy<BluetoothRemoteGATTCharacteristic>;
                                let pnpIdChar: MockProxy<BluetoothRemoteGATTCharacteristic>;
                                let pybricksService: MockProxy<BluetoothRemoteGATTService>;
                                let pybricksChar: MockProxy<BluetoothRemoteGATTCharacteristic>;
                                let uartService: MockProxy<BluetoothRemoteGATTService>;
                                let uartRxChar: MockProxy<BluetoothRemoteGATTCharacteristic>;
                                let uartTxChar: MockProxy<BluetoothRemoteGATTCharacteristic>;

                                beforeEach(() => {
                                    firmwareRevisionChar =
                                        mock<BluetoothRemoteGATTCharacteristic>();
                                    firmwareRevisionChar.readValue.mockResolvedValue(
                                        new DataView(encoder.encode('3.2.0b2').buffer),
                                    );

                                    softwareRevisionChar =
                                        mock<BluetoothRemoteGATTCharacteristic>();
                                    softwareRevisionChar.readValue.mockResolvedValue(
                                        new DataView(encoder.encode('1.1.0').buffer),
                                    );

                                    pnpIdChar =
                                        mock<BluetoothRemoteGATTCharacteristic>();
                                    pnpIdChar.readValue.mockResolvedValue(
                                        new DataView(
                                            encodeInfo(HubType.TechnicHub).buffer,
                                        ),
                                    );

                                    deviceInfoService.getCharacteristic
                                        .calledWith(firmwareRevisionStringUUID)
                                        .mockResolvedValue(firmwareRevisionChar);
                                    deviceInfoService.getCharacteristic
                                        .calledWith(softwareRevisionStringUUID)
                                        .mockResolvedValue(softwareRevisionChar);
                                    deviceInfoService.getCharacteristic
                                        .calledWith(pnpIdUUID)
                                        .mockResolvedValue(pnpIdChar);

                                    pybricksService =
                                        mock<BluetoothRemoteGATTService>();

                                    gatt.getPrimaryService
                                        .calledWith(pybricksServiceUUID)
                                        .mockResolvedValue(pybricksService);

                                    const pybricksCharEventTarget = new EventTarget();
                                    pybricksChar =
                                        mock<BluetoothRemoteGATTCharacteristic>({
                                            addEventListener:
                                                pybricksCharEventTarget.addEventListener.bind(
                                                    pybricksCharEventTarget,
                                                ),
                                            removeEventListener:
                                                pybricksCharEventTarget.removeEventListener.bind(
                                                    pybricksCharEventTarget,
                                                ),
                                            dispatchEvent:
                                                pybricksCharEventTarget.dispatchEvent.bind(
                                                    pybricksCharEventTarget,
                                                ),
                                        });
                                    pybricksChar.startNotifications.mockResolvedValue(
                                        pybricksChar,
                                    );
                                    pybricksChar.stopNotifications.mockResolvedValue(
                                        pybricksChar,
                                    );

                                    pybricksService.getCharacteristic
                                        .calledWith(pybricksCommandCharacteristicUUID)
                                        .mockResolvedValue(pybricksChar);

                                    uartService = mock<BluetoothRemoteGATTService>();

                                    gatt.getPrimaryService
                                        .calledWith(uartServiceUUID)
                                        .mockResolvedValue(uartService);

                                    uartRxChar =
                                        mock<BluetoothRemoteGATTCharacteristic>();
                                    uartService.getCharacteristic
                                        .calledWith(uartRxCharUUID)
                                        .mockResolvedValue(uartRxChar);

                                    uartTxChar =
                                        mock<BluetoothRemoteGATTCharacteristic>();
                                    uartService.getCharacteristic
                                        .calledWith(uartTxCharUUID)
                                        .mockResolvedValue(uartTxChar);
                                });

                                it('should put didConnection action', async () => {
                                    saga.put(connect());

                                    // TODO: there are a bunch of untested failure paths

                                    await expect(saga.take()).resolves.toEqual(
                                        bleDIServiceDidReceiveFirmwareRevision(
                                            '3.2.0b2',
                                        ),
                                    );

                                    await expect(saga.take()).resolves.toEqual(
                                        bleDIServiceDidReceiveSoftwareRevision('1.1.0'),
                                    );

                                    await expect(saga.take()).resolves.toEqual(
                                        bleDIServiceDidReceivePnPId({
                                            productId: 0x80,
                                            productVersion: 0,
                                            vendorId: 919,
                                            vendorIdSource: 1,
                                        }),
                                    );

                                    await expect(saga.take()).resolves.toEqual(
                                        didConnect('test-id', 'test name'),
                                    );
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    afterEach(async () => {
        await saga.end();
    });
});
