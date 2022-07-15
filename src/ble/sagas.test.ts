// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { HubType } from '@pybricks/firmware';
import { MockProxy, mock } from 'jest-mock-extended';
import { AsyncSaga } from '../../test';
import { alertsShowAlert } from '../alerts/actions';
import {
    bleDIServiceDidReceiveFirmwareRevision,
    bleDIServiceDidReceivePnPId,
    bleDIServiceDidReceiveSoftwareRevision,
} from '../ble-device-info-service/actions';
import {
    deviceInformationServiceUUID,
    firmwareRevisionStringUUID,
    pnpIdUUID,
    softwareRevisionStringUUID,
} from '../ble-device-info-service/protocol';
import { encodeInfo } from '../ble-device-info-service/protocol.test';
import {
    nordicUartRxCharUUID,
    nordicUartServiceUUID,
    nordicUartTxCharUUID,
} from '../ble-nordic-uart-service/protocol';
import {
    pybricksControlCharacteristicUUID,
    pybricksServiceUUID,
} from '../ble-pybricks-service/protocol';
import {
    BleDeviceFailToConnectReasonType,
    bleConnectPybricks,
    bleDidConnectPybricks,
    bleDidDisconnectPybricks,
    bleDidFailToConnectPybricks,
    bleDisconnectPybricks,
    toggleBluetooth,
} from './actions';
import { BleConnectionState } from './reducers';
import ble from './sagas';

const encoder = new TextEncoder();

afterEach(() => {
    jest.clearAllMocks();
});

type Mocks = {
    bluetooth: MockProxy<Bluetooth>;
    device: MockProxy<BluetoothDevice>;
    gatt: MockProxy<BluetoothRemoteGATTServer>;
    deviceInfoService: MockProxy<BluetoothRemoteGATTService>;
    firmwareRevisionChar: MockProxy<BluetoothRemoteGATTCharacteristic>;
    softwareRevisionChar: MockProxy<BluetoothRemoteGATTCharacteristic>;
    pnpIdChar: MockProxy<BluetoothRemoteGATTCharacteristic>;
    pybricksService: MockProxy<BluetoothRemoteGATTService>;
    pybricksChar: MockProxy<BluetoothRemoteGATTCharacteristic>;
    uartService: MockProxy<BluetoothRemoteGATTService>;
    uartRxChar: MockProxy<BluetoothRemoteGATTCharacteristic>;
    uartTxChar: MockProxy<BluetoothRemoteGATTCharacteristic>;
};

/**
 * Creates mocks used in connect tests.
 */
function createMocks(): Mocks {
    const firmwareRevisionChar = mock<BluetoothRemoteGATTCharacteristic>();
    firmwareRevisionChar.readValue.mockResolvedValue(
        new DataView(encoder.encode('3.2.0b2').buffer),
    );

    const softwareRevisionChar = mock<BluetoothRemoteGATTCharacteristic>();
    softwareRevisionChar.readValue.mockResolvedValue(
        new DataView(encoder.encode('1.1.0').buffer),
    );

    const pnpIdChar = mock<BluetoothRemoteGATTCharacteristic>();
    pnpIdChar.readValue.mockResolvedValue(
        new DataView(encodeInfo(HubType.TechnicHub).buffer),
    );

    const deviceInfoService = mock<BluetoothRemoteGATTService>();
    deviceInfoService.getCharacteristic
        .calledWith(firmwareRevisionStringUUID)
        .mockResolvedValue(firmwareRevisionChar);
    deviceInfoService.getCharacteristic
        .calledWith(softwareRevisionStringUUID)
        .mockResolvedValue(softwareRevisionChar);
    deviceInfoService.getCharacteristic
        .calledWith(pnpIdUUID)
        .mockResolvedValue(pnpIdChar);

    const pybricksCharEventTarget = new EventTarget();
    const pybricksChar = mock<BluetoothRemoteGATTCharacteristic>({
        addEventListener: pybricksCharEventTarget.addEventListener.bind(
            pybricksCharEventTarget,
        ),
        removeEventListener: pybricksCharEventTarget.removeEventListener.bind(
            pybricksCharEventTarget,
        ),
        dispatchEvent: pybricksCharEventTarget.dispatchEvent.bind(
            pybricksCharEventTarget,
        ),
    });
    pybricksChar.startNotifications.mockResolvedValue(pybricksChar);
    pybricksChar.stopNotifications.mockResolvedValue(pybricksChar);

    const pybricksService = mock<BluetoothRemoteGATTService>();
    pybricksService.getCharacteristic
        .calledWith(pybricksControlCharacteristicUUID)
        .mockResolvedValue(pybricksChar);

    const uartRxChar = mock<BluetoothRemoteGATTCharacteristic>();

    const uartTxCharEventTarget = new EventTarget();
    const uartTxChar = mock<BluetoothRemoteGATTCharacteristic>({
        addEventListener:
            uartTxCharEventTarget.addEventListener.bind(uartTxCharEventTarget),
        removeEventListener:
            uartTxCharEventTarget.removeEventListener.bind(uartTxCharEventTarget),
        dispatchEvent: uartTxCharEventTarget.dispatchEvent.bind(uartTxCharEventTarget),
    });

    const uartService = mock<BluetoothRemoteGATTService>();
    uartService.getCharacteristic
        .calledWith(nordicUartRxCharUUID)
        .mockResolvedValue(uartRxChar);
    uartService.getCharacteristic
        .calledWith(nordicUartTxCharUUID)
        .mockResolvedValue(uartTxChar);

    const gatt = mock<BluetoothRemoteGATTServer>();
    gatt.connect.mockResolvedValue(gatt);
    gatt.disconnect.mockImplementation(() => {
        setTimeout(() => {
            device.dispatchEvent(new Event('gattserverdisconnected'));
        }, 10);
    });
    gatt.getPrimaryService
        .calledWith(deviceInformationServiceUUID)
        .mockResolvedValue(deviceInfoService);
    gatt.getPrimaryService
        .calledWith(pybricksServiceUUID)
        .mockResolvedValue(pybricksService);
    gatt.getPrimaryService
        .calledWith(nordicUartServiceUUID)
        .mockResolvedValue(uartService);

    const deviceEvents = new EventTarget();
    const device = mock<BluetoothDevice>({
        id: 'test-id',
        name: 'test name',
        gatt,
        addEventListener: deviceEvents.addEventListener.bind(
            deviceEvents,
        ) as BluetoothDevice['addEventListener'],
        removeEventListener: deviceEvents.removeEventListener.bind(deviceEvents),
        dispatchEvent: deviceEvents.dispatchEvent.bind(deviceEvents),
    });

    const bluetooth = mock<Bluetooth>();
    bluetooth.getAvailability.mockResolvedValue(true);
    bluetooth.requestDevice.mockResolvedValue(device);

    return {
        bluetooth,
        device,
        gatt,
        deviceInfoService,
        firmwareRevisionChar,
        softwareRevisionChar,
        pnpIdChar,
        pybricksService,
        pybricksChar,
        uartService,
        uartRxChar,
        uartTxChar,
    };
}

enum ConnectRunPoint {
    Connect,
    DidReceiveFirmwareRevision,
    DidReceiveSoftwareRevision,
    DidReceivePnpId,
    DidConnect,
}

/**
 * Run the "success" path of the connect saga until a given point.
 *
 * This helps avoid duplicate code in tests.
 *
 * @param saga The saga.
 * @param point The point at which to stop running.
 */
async function runConnectUntil(saga: AsyncSaga, point: ConnectRunPoint): Promise<void> {
    saga.put(bleConnectPybricks());

    if (point === ConnectRunPoint.Connect) {
        return;
    }

    await expect(saga.take()).resolves.toEqual(
        bleDIServiceDidReceiveFirmwareRevision('3.2.0b2'),
    );

    if (point === ConnectRunPoint.DidReceiveFirmwareRevision) {
        return;
    }

    await expect(saga.take()).resolves.toEqual(
        bleDIServiceDidReceiveSoftwareRevision('1.1.0'),
    );

    if (point === ConnectRunPoint.DidReceiveSoftwareRevision) {
        return;
    }

    await expect(saga.take()).resolves.toEqual(
        bleDIServiceDidReceivePnPId({
            productId: 0x80,
            productVersion: 0,
            vendorId: 919,
            vendorIdSource: 1,
        }),
    );

    if (point === ConnectRunPoint.DidReceivePnpId) {
        return;
    }

    await expect(saga.take()).resolves.toEqual(
        bleDidConnectPybricks('test-id', 'test name'),
    );
}

describe('connect action is dispatched', () => {
    let saga: AsyncSaga;

    beforeEach(() => {
        saga = new AsyncSaga(ble);
    });

    it('should fail if no web bluetooth', async () => {
        await runConnectUntil(saga, ConnectRunPoint.Connect);

        await expect(saga.take()).resolves.toEqual(
            alertsShowAlert('ble', 'noWebBluetooth'),
        );
        await expect(saga.take()).resolves.toEqual(
            bleDidFailToConnectPybricks({
                reason: BleDeviceFailToConnectReasonType.NoWebBluetooth,
            }),
        );
    });

    describe('has web bluetooth', () => {
        let mocks: Mocks;
        beforeEach(() => {
            mocks = createMocks();
            navigator.bluetooth = mocks.bluetooth;
        });

        it('should fail if bluetooth is not available', async () => {
            jest.spyOn(navigator.bluetooth, 'getAvailability').mockResolvedValue(false);

            await runConnectUntil(saga, ConnectRunPoint.Connect);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('ble', 'bluetoothNotAvailable'),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.NoBluetooth,
                }),
            );
        });

        it('should fail if user canceled requestDevice', async () => {
            jest.spyOn(navigator.bluetooth, 'requestDevice').mockRejectedValue(
                new DOMException('test error', 'NotFoundError'),
            );

            await runConnectUntil(saga, ConnectRunPoint.Connect);

            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Canceled,
                }),
            );
        });

        it('should fail on other exception in requestDevice', async () => {
            const testError = new DOMException('test error', 'SecurityError');
            jest.spyOn(navigator.bluetooth, 'requestDevice').mockRejectedValue(
                testError,
            );

            await runConnectUntil(saga, ConnectRunPoint.Connect);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Unknown,
                    err: testError,
                }),
            );
        });

        it('should fail if device has no gatt property', async () => {
            Object.defineProperty(mocks.device, 'gatt', { value: undefined });

            await runConnectUntil(saga, ConnectRunPoint.Connect);

            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.NoGatt,
                }),
            );
        });

        it('should fail if gatt connect fails', async () => {
            const testError = new DOMException('test error', 'NetworkError');
            mocks.gatt.connect.mockRejectedValueOnce(testError);

            await runConnectUntil(saga, ConnectRunPoint.Connect);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Unknown,
                    err: testError,
                }),
            );
        });

        it('should fail if device does not have device info service', async () => {
            const testError = new DOMException('test error', 'NotFoundError');
            mocks.gatt.getPrimaryService
                .calledWith(deviceInformationServiceUUID)
                .mockRejectedValueOnce(testError);

            await runConnectUntil(saga, ConnectRunPoint.Connect);

            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.NoDeviceInfoService,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should fail if getting firmware revision characteristic fails', async () => {
            const testError = new Error('test error');
            mocks.deviceInfoService.getCharacteristic
                .calledWith(firmwareRevisionStringUUID)
                .mockRejectedValue(testError);

            await runConnectUntil(saga, ConnectRunPoint.Connect);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Unknown,
                    err: testError,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should fail if reading firmware revision characteristic fails', async () => {
            const testError = new Error('test error');
            mocks.firmwareRevisionChar.readValue.mockRejectedValue(testError);

            await runConnectUntil(saga, ConnectRunPoint.Connect);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Unknown,
                    err: testError,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should fail if getting software revision characteristic fails', async () => {
            const testError = new Error('test error');
            mocks.deviceInfoService.getCharacteristic
                .calledWith(softwareRevisionStringUUID)
                .mockRejectedValueOnce(testError);

            await runConnectUntil(saga, ConnectRunPoint.DidReceiveFirmwareRevision);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Unknown,
                    err: testError,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should fail if reading software revision characteristic fails', async () => {
            const testError = new Error('test error');
            mocks.softwareRevisionChar.readValue.mockRejectedValue(testError);

            await runConnectUntil(saga, ConnectRunPoint.DidReceiveFirmwareRevision);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Unknown,
                    err: testError,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should skip bleDIServiceDidReceivePnPId action if getting pnp id characteristic fails', async () => {
            const testError = new DOMException('test error', 'NotFoundError');
            mocks.deviceInfoService.getCharacteristic
                .calledWith(pnpIdUUID)
                .mockRejectedValueOnce(testError);

            await runConnectUntil(saga, ConnectRunPoint.DidReceiveSoftwareRevision);

            await expect(saga.take()).resolves.toEqual(
                bleDidConnectPybricks('test-id', 'test name'),
            );
        });

        it('should fail if reading pnp id characteristic fails', async () => {
            const testError = new Error('test error');
            mocks.pnpIdChar.readValue.mockRejectedValue(testError);

            await runConnectUntil(saga, ConnectRunPoint.DidReceiveSoftwareRevision);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Unknown,
                    err: testError,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should fail if device does not have pybricks service', async () => {
            const testError = new DOMException('test error', 'NotFoundError');
            mocks.gatt.getPrimaryService
                .calledWith(pybricksServiceUUID)
                .mockRejectedValueOnce(testError);

            await runConnectUntil(saga, ConnectRunPoint.DidReceivePnpId);

            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.NoPybricksService,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should fail if getting pybricks characteristic fails', async () => {
            const testError = new Error('test error');
            mocks.pybricksService.getCharacteristic
                .calledWith(pybricksControlCharacteristicUUID)
                .mockRejectedValue(testError);

            await runConnectUntil(saga, ConnectRunPoint.DidReceivePnpId);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Unknown,
                    err: testError,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should fail if stopping pybricks characteristic notifications fails', async () => {
            const testError = new Error('test error');
            mocks.pybricksChar.stopNotifications.mockRejectedValue(testError);

            await runConnectUntil(saga, ConnectRunPoint.DidReceivePnpId);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Unknown,
                    err: testError,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should fail if starting pybricks characteristic notifications fails', async () => {
            const testError = new Error('test error');
            mocks.pybricksChar.startNotifications.mockRejectedValue(testError);

            await runConnectUntil(saga, ConnectRunPoint.DidReceivePnpId);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Unknown,
                    err: testError,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should fail if device does not have nordic uart service', async () => {
            const testError = new DOMException('test error', 'NotFoundError');
            mocks.gatt.getPrimaryService
                .calledWith(nordicUartServiceUUID)
                .mockRejectedValueOnce(testError);

            await runConnectUntil(saga, ConnectRunPoint.DidReceivePnpId);

            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    // FIXME: this is wrong error
                    reason: BleDeviceFailToConnectReasonType.NoPybricksService,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should fail if getting nordic uart rx characteristic fails', async () => {
            const testError = new Error('test error');
            mocks.uartService.getCharacteristic
                .calledWith(nordicUartRxCharUUID)
                .mockRejectedValue(testError);

            await runConnectUntil(saga, ConnectRunPoint.DidReceivePnpId);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Unknown,
                    err: testError,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should fail if getting nordic uart tx characteristic fails', async () => {
            const testError = new Error('test error');
            mocks.uartService.getCharacteristic
                .calledWith(nordicUartTxCharUUID)
                .mockRejectedValue(testError);

            await runConnectUntil(saga, ConnectRunPoint.DidReceivePnpId);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Unknown,
                    err: testError,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should fail if stopping nordic uart tx  characteristic notifications fails', async () => {
            const testError = new Error('test error');
            mocks.uartTxChar.stopNotifications.mockRejectedValue(testError);

            await runConnectUntil(saga, ConnectRunPoint.DidReceivePnpId);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Unknown,
                    err: testError,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should fail if starting nordic uart tx characteristic notifications fails', async () => {
            const testError = new Error('test error');
            mocks.uartTxChar.startNotifications.mockRejectedValue(testError);

            await runConnectUntil(saga, ConnectRunPoint.DidReceivePnpId);

            await expect(saga.take()).resolves.toEqual(
                alertsShowAlert('alerts', 'unexpectedError', { error: testError }),
            );
            await expect(saga.take()).resolves.toEqual(
                bleDidFailToConnectPybricks({
                    reason: BleDeviceFailToConnectReasonType.Unknown,
                    err: testError,
                }),
            );

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });

        it('should put didConnection action', async () => {
            await runConnectUntil(saga, ConnectRunPoint.DidConnect);
        });

        it('should handle disconnect', async () => {
            await runConnectUntil(saga, ConnectRunPoint.DidConnect);

            saga.put(bleDisconnectPybricks());

            await expect(saga.take()).resolves.toEqual(bleDidDisconnectPybricks());

            expect(mocks.gatt.disconnect).toHaveBeenCalled();
        });
    });

    afterEach(async () => {
        await saga.end();
    });
});

describe('toggleBluetooth action', () => {
    it('should connect when disconnected', async () => {
        const saga = new AsyncSaga(ble);

        saga.updateState({ ble: { connection: BleConnectionState.Disconnected } });

        saga.put(toggleBluetooth());

        await expect(saga.take()).resolves.toEqual(bleConnectPybricks());
    });

    it('should disconnect when connected', async () => {
        const saga = new AsyncSaga(ble);

        saga.updateState({ ble: { connection: BleConnectionState.Connected } });

        saga.put(toggleBluetooth());

        await expect(saga.take()).resolves.toEqual(bleDisconnectPybricks());
    });
});
