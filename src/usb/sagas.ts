// SPDX-License-Identifier: MIT
// Copyright (c) 2025-2026 The Pybricks Authors

import { firmwareVersion } from '@pybricks/firmware';
import { AnyAction } from 'redux';
import { eventChannel } from 'redux-saga';
import semver from 'semver';
import {
    actionChannel,
    call,
    delay,
    fork,
    put,
    race,
    select,
    spawn,
    take,
    takeEvery,
} from 'typed-redux-saga/macro';
import { alertsDidShowAlert, alertsShowAlert } from '../alerts/actions';
import { BleConnectionState } from '../ble/reducers';
import { supportedPybricksProfileVersion } from '../ble/sagas';
import {
    PnpIdVendorIdSource,
    deviceNameUUID,
    firmwareRevisionStringUUID,
    softwareRevisionStringUUID,
} from '../ble-device-info-service/protocol';
import {
    blePybricksServiceDidReceiveHubCapabilities,
    didFailToWriteCommand,
    didNotifyEvent,
    didWriteCommand,
    writeCommand,
} from '../ble-pybricks-service/actions';
import { pybricksHubCapabilitiesCharacteristicUUID } from '../ble-pybricks-service/protocol';
import { firmwareInstallPybricks } from '../firmware/actions';
import { RootState } from '../reducers';
import { assert, defined, ensureError, maybe } from '../utils';
import { pythonVersionToSemver } from '../utils/version';
import {
    usbConnectPybricks,
    usbDidConnectPybricks,
    usbDidDisconnectPybricks,
    usbDidFailToConnectPybricks,
    usbDidReceiveDeviceName,
    usbDidReceiveFirmwareRevision,
    usbDidReceivePybricksMessageResponse,
    usbDidReceiveSoftwareRevision,
    usbDisconnectPybricks,
    usbHotPlugConnectPybricks,
    usbPybricksDidFailToSubscribe,
    usbPybricksDidFailToUnsubscribe,
    usbPybricksDidSubscribe,
    usbPybricksDidUnsubscribe,
    usbPybricksSubscribe,
    usbPybricksUnsubscribe,
    usbToggle,
} from './actions';
import { UsbConnectionState } from './reducers';
import {
    PybricksUsbInEndpointMessageType,
    PybricksUsbInterfaceRequest,
    PybricksUsbOutEndpointMessageType,
    pybricksUsbClass,
    pybricksUsbProtocol,
    pybricksUsbRequestMaxLength,
    pybricksUsbSubclass,
    uuid16,
} from '.';

const textDecoder = new TextDecoder('utf-8');

function* handleUsbConnectPybricks(hotPlugDevice?: USBDevice): Generator {
    // Normally, this would be triggered by usbConnectPybricks(), but on hotplug
    // events, this doens't happen, so we need a different action to trigger
    // so that reducers still work correctly.
    if (hotPlugDevice !== undefined) {
        yield* put(usbHotPlugConnectPybricks());
    }

    if (navigator.usb === undefined) {
        yield* put(alertsShowAlert('usb', 'noWebUsb'));
        yield* put(usbDidFailToConnectPybricks());
        return;
    }

    const exitStack: Array<() => Promise<void>> = [];
    function* cleanup() {
        for (const func of exitStack.reverse()) {
            yield* call(() => func());
        }
    }

    const disconnectChannel = eventChannel<USBConnectionEvent>((emitter) => {
        navigator.usb.addEventListener('disconnect', emitter);
        return () => {
            navigator.usb.removeEventListener('disconnect', emitter);
        };
    });

    exitStack.push(async () => disconnectChannel.close());

    let usbDevice: USBDevice;

    // if we are not responding to a hotplug event, we need to request the device
    if (hotPlugDevice === undefined) {
        const [reqDevice, reqDeviceErr] = yield* call(() =>
            maybe(
                navigator.usb.requestDevice({
                    filters: [
                        {
                            classCode: pybricksUsbClass,
                            subclassCode: pybricksUsbSubclass,
                            protocolCode: pybricksUsbProtocol,
                        },
                    ],
                }),
            ),
        );

        if (reqDeviceErr) {
            if (reqDeviceErr.name === 'NotFoundError') {
                // This means the user canceled the device selection dialog.
                // REVISIT: should we show noHub message like BLE?
                yield* put(usbDidFailToConnectPybricks());
                yield* cleanup();
                return;
            }

            yield* put(
                alertsShowAlert('alerts', 'unexpectedError', { error: reqDeviceErr }),
            );
            console.error('Failed to request USB device:', reqDeviceErr);
            yield* put(usbDidFailToConnectPybricks());
            yield* cleanup();
            return;
        }

        defined(reqDevice);
        usbDevice = reqDevice;
    } else {
        usbDevice = hotPlugDevice;
    }

    for (let retry = 1; ; retry++) {
        const [, openErr] = yield* call(() => maybe(usbDevice.open()));
        if (openErr) {
            // On Linux/Android, the udev rules could still be processing, try
            // a few times before giving up.
            if (openErr.name === 'SecurityError' && retry <= 5) {
                console.debug(
                    `Retrying USB device open (${retry}/5) after SecurityError on Linux`,
                );
                yield* delay(100);
                continue;
            }

            // Only show error to the user if they initiated the connection.
            if (hotPlugDevice === undefined) {
                if (openErr.name === 'SecurityError') {
                    // Known causes:
                    // - Linux without proper udev rules to allow access to USB devices
                    // - Trying to access a device on a host machine when the USB
                    //   device is shared with a VM guest OS.
                    // Other suspected causes:
                    // - Issues with permissions in containerized apps (e.g. Snaps on Ubuntu)
                    yield* put(alertsShowAlert('usb', 'accessDenied'));
                } else {
                    yield* put(
                        alertsShowAlert('alerts', 'unexpectedError', {
                            error: openErr,
                        }),
                    );
                }
            }

            console.error('Failed to open USB device:', openErr);
            yield* put(usbDidFailToConnectPybricks());
            yield* cleanup();
            return;
        }

        break;
    }

    exitStack.push(() => usbDevice.close().catch(console.debug));

    const [, selectErr] = yield* call(() => maybe(usbDevice.selectConfiguration(1)));
    if (selectErr) {
        yield* put(alertsShowAlert('alerts', 'unexpectedError', { error: selectErr }));
        console.error('Failed to select USB device configuration:', selectErr);
        yield* put(usbDidFailToConnectPybricks());
        yield* cleanup();
        return;
    }

    assert(usbDevice.configuration !== null, 'USB device configuration is null');

    const iface = usbDevice.configuration.interfaces.find(
        (iface) =>
            iface.alternate.interfaceClass === pybricksUsbClass &&
            iface.alternate.interfaceSubclass === pybricksUsbSubclass &&
            iface.alternate.interfaceProtocol === pybricksUsbProtocol,
    );
    assert(iface !== undefined, 'USB device does not have a Pybricks interface');

    const inEndpoint = iface.alternate.endpoints.find(
        (ep) => ep.direction === 'in' && ep.type === 'bulk',
    );
    assert(
        inEndpoint !== undefined,
        'USB device does not have a bulk IN endpoint for Pybricks interface',
    );

    const outEndpoint = iface.alternate.endpoints.find(
        (ep) => ep.direction === 'out' && ep.type === 'bulk',
    );
    assert(
        outEndpoint !== undefined,
        'USB device does not have a bulk OUT endpoint for Pybricks interface',
    );

    const [, claimErr] = yield* call(() =>
        maybe(usbDevice.claimInterface(iface.interfaceNumber)),
    );
    if (claimErr) {
        // Only show error to the user if they initiated the connection.
        if (hotPlugDevice === undefined) {
            if (claimErr.name === 'NetworkError') {
                yield* put(alertsShowAlert('usb', 'alreadyInUse'));
            } else {
                yield* put(
                    alertsShowAlert('alerts', 'unexpectedError', { error: claimErr }),
                );
            }
        }

        console.error('Failed to claim USB interface:', claimErr);
        yield* put(usbDidFailToConnectPybricks());
        yield* cleanup();
        return;
    }

    exitStack.push(() => usbDevice.releaseInterface(0).catch(console.debug));

    const [fwVerResult, fwVerError] = yield* call(() =>
        maybe(
            usbDevice.controlTransferIn(
                {
                    requestType: 'class',
                    recipient: 'interface',
                    request: PybricksUsbInterfaceRequest.Gatt,
                    value: firmwareRevisionStringUUID,
                    index: 0x00,
                },
                pybricksUsbRequestMaxLength,
            ),
        ),
    );
    if (fwVerError || fwVerResult?.status !== 'ok') {
        yield* put(
            alertsShowAlert('alerts', 'unexpectedError', {
                error: fwVerError || ensureError(fwVerResult?.status),
            }),
        );
        console.error('Failed to get firmware version:', fwVerError);
        yield* put(usbDidFailToConnectPybricks());
        yield* cleanup();
        return;
    }
    defined(fwVerResult);

    const firmwareRevision = textDecoder.decode(fwVerResult.data);

    yield* put(usbDidReceiveFirmwareRevision(firmwareRevision));

    // notify user if old firmware
    if (
        semver.lt(
            pythonVersionToSemver(firmwareRevision),
            pythonVersionToSemver(firmwareVersion),
        )
    ) {
        yield* put(alertsShowAlert('usb', 'oldFirmware'));

        // initiate flashing firmware if user requested
        const flashIfRequested = function* () {
            const { action } = yield* take<
                ReturnType<typeof alertsDidShowAlert<'usb', 'oldFirmware'>>
            >(
                alertsDidShowAlert.when(
                    (a) => a.domain === 'usb' && a.specific === 'oldFirmware',
                ),
            );

            if (action === 'flashFirmware') {
                yield* put(firmwareInstallPybricks());
            }
        };

        // have to spawn so that we don't block the task and it still works
        // if parent task ends
        yield* spawn(flashIfRequested);
    }

    const [nameResult, nameError] = yield* call(() =>
        maybe(
            usbDevice.controlTransferIn(
                {
                    requestType: 'class',
                    recipient: 'interface',
                    request: PybricksUsbInterfaceRequest.Gatt,
                    value: deviceNameUUID,
                    index: 0x00,
                },
                pybricksUsbRequestMaxLength,
            ),
        ),
    );
    if (nameError || nameResult?.status !== 'ok') {
        yield* put(
            alertsShowAlert('alerts', 'unexpectedError', {
                error: nameError || ensureError(nameResult?.status),
            }),
        );
        console.error('Failed to get device name:', nameError);
        yield* put(usbDidFailToConnectPybricks());
        yield* cleanup();
        return;
    }
    defined(nameResult);

    const deviceName = textDecoder.decode(nameResult.data);

    yield* put(usbDidReceiveDeviceName(deviceName));

    const [swVerResult, swVerError] = yield* call(() =>
        maybe(
            usbDevice.controlTransferIn(
                {
                    requestType: 'class',
                    recipient: 'interface',
                    request: PybricksUsbInterfaceRequest.Gatt,
                    value: softwareRevisionStringUUID,
                    index: 0x00,
                },
                pybricksUsbRequestMaxLength,
            ),
        ),
    );
    if (swVerError || swVerResult?.status !== 'ok') {
        yield* put(
            alertsShowAlert('alerts', 'unexpectedError', {
                error: swVerError || ensureError(swVerResult?.status),
            }),
        );
        console.error('Failed to get software version:', swVerError);
        yield* put(usbDidFailToConnectPybricks());
        yield* cleanup();
        return;
    }
    defined(swVerResult);

    const softwareRevision = textDecoder.decode(swVerResult.data);

    yield* put(usbDidReceiveSoftwareRevision(softwareRevision));

    // notify user if newer Pybricks Profile on hub
    if (
        semver.gte(
            softwareRevision,
            new semver.SemVer(supportedPybricksProfileVersion).inc('minor'),
        )
    ) {
        yield* put(
            alertsShowAlert('ble', 'newPybricksProfile', {
                hubVersion: softwareRevision,
                supportedVersion: supportedPybricksProfileVersion,
            }),
        );
    }

    const [hubCapResult, hubCapErr] = yield* call(() =>
        maybe(
            usbDevice.controlTransferIn(
                {
                    requestType: 'class',
                    recipient: 'interface',
                    request: PybricksUsbInterfaceRequest.Pybricks,
                    value: uuid16(pybricksHubCapabilitiesCharacteristicUUID),
                    index: 0x00,
                },
                pybricksUsbRequestMaxLength,
            ),
        ),
    );
    if (hubCapErr || hubCapResult?.status !== 'ok') {
        yield* put(
            alertsShowAlert('alerts', 'unexpectedError', {
                error: hubCapErr || ensureError(hubCapResult?.status),
            }),
        );
        console.error('Failed to get hub capabilities:', hubCapErr);
        yield* put(usbDidFailToConnectPybricks());
        yield* cleanup();
        return;
    }
    defined(hubCapResult);
    assert(hubCapResult.data !== undefined, 'Hub capabilities data is undefined');

    const hubCapabilitiesValue = new DataView(hubCapResult.data.buffer);

    const maxWriteSize = hubCapabilitiesValue.getUint16(0, true);
    const flags = hubCapabilitiesValue.getUint32(2, true);
    const maxUserProgramSize = hubCapabilitiesValue.getUint32(6, true);
    const numOfSlots = hubCapabilitiesValue.getUint8(10);

    yield* put(
        blePybricksServiceDidReceiveHubCapabilities(
            maxWriteSize,
            flags,
            maxUserProgramSize,
            numOfSlots,
        ),
    );

    // This services the Pybricks interface IN endpoint and pipes messages
    // to the correct place depending on the message type. We need to get this
    // up and running before subscribing to events or sending commands so that
    // we can receive responses.
    function* receiveMessages(): Generator {
        defined(usbDevice);
        defined(inEndpoint);
        defined(outEndpoint);

        for (;;) {
            const [result, err] = yield* call(() =>
                maybe(
                    usbDevice.transferIn(
                        inEndpoint.endpointNumber,
                        inEndpoint.packetSize,
                    ),
                ),
            );
            if (err) {
                // TODO: notify user that USB is broken (if not disconnected)
                console.error('Failed to receive USB message:', err);
                return;
            }

            if (result?.status !== 'ok') {
                console.warn('USB message transfer failed:', result);
                continue;
            }

            assert(result.data !== undefined, 'USB message data is undefined');

            if (result.data.byteLength < 1) {
                // empty messages are normal, just ignore them
                continue;
            }

            console.debug('Received USB message:', result.data);

            switch (result.data.getInt8(0)) {
                case PybricksUsbInEndpointMessageType.Response:
                    yield* put(
                        usbDidReceivePybricksMessageResponse(
                            result.data.getUint32(1, true),
                        ),
                    );
                    break;
                case PybricksUsbInEndpointMessageType.Event:
                    yield* put(
                        didNotifyEvent(new DataView(result.data.buffer.slice(1))),
                    );
                    break;
                default:
                    console.warn('Unknown USB message type:', result.data.getInt8(0));
                    break;
            }
        }
    }

    const receiveMessagesTask = yield* fork(receiveMessages);
    exitStack.push(async () => receiveMessagesTask.cancel());

    // This is used to serialize requests to the Pybricks interface OUT endpoint.
    // It makes sure that we wait for a response for each command before sending
    // the next one.
    function* sendMessages(): Generator {
        defined(usbDevice);
        defined(outEndpoint);

        const chan = yield* actionChannel<AnyAction>(
            (a: AnyAction) =>
                usbPybricksSubscribe.matches(a) ||
                usbPybricksUnsubscribe.matches(a) ||
                writeCommand.matches(a),
        );

        // Response may come before request returns, so we need to buffer them
        // in a channel to avoid missing responses.
        const responseChannel = yield* actionChannel(
            usbDidReceivePybricksMessageResponse,
        );

        for (;;) {
            const action = yield* take(chan);

            console.debug('Processing USB action:', action);

            if (usbPybricksSubscribe.matches(action)) {
                const message = new DataView(new ArrayBuffer(2));
                message.setUint8(0, PybricksUsbOutEndpointMessageType.Subscribe);
                message.setUint8(1, 1); // subscribe to events

                const [result, err] = yield* call(() =>
                    maybe(usbDevice.transferOut(outEndpoint.endpointNumber, message)),
                );
                if (err || result?.status !== 'ok') {
                    yield* put(usbPybricksDidFailToSubscribe());
                    console.error('Failed to send USB subscribe message:', err, result);
                    continue;
                }

                yield* put(usbPybricksDidSubscribe());

                continue;
            }

            if (usbPybricksUnsubscribe.matches(action)) {
                const message = new DataView(new ArrayBuffer(2));
                message.setUint8(0, PybricksUsbOutEndpointMessageType.Subscribe);
                message.setUint8(1, 0); // unsubscribe from events

                const [result, err] = yield* call(() =>
                    maybe(usbDevice.transferOut(outEndpoint.endpointNumber, message)),
                );
                if (err || result?.status !== 'ok') {
                    yield* put(usbPybricksDidFailToUnsubscribe());
                    console.error(
                        'Failed to send USB unsubscribe message:',
                        err,
                        result,
                    );
                    continue;
                }

                yield* put(usbPybricksDidUnsubscribe());

                continue;
            }

            if (writeCommand.matches(action)) {
                const payload = new Uint8Array(1 + action.value.length);
                payload[0] = PybricksUsbOutEndpointMessageType.Command;
                payload.set(action.value, 1);
                const message = new DataView(payload.buffer);

                const [result, err] = yield* call(() =>
                    maybe(usbDevice.transferOut(outEndpoint.endpointNumber, message)),
                );
                if (err) {
                    yield* put(didFailToWriteCommand(action.id, ensureError(err)));
                    console.error('Failed to send USB command:', err, result);
                    continue;
                }

                if (result?.status !== 'ok') {
                    yield* put(
                        didFailToWriteCommand(action.id, ensureError(result?.status)),
                    );
                    console.error('Failed to send USB command:', result);
                    continue;
                }

                const { response, timeout } = yield* race({
                    response: take(responseChannel),
                    timeout: delay(1000),
                });

                if (timeout) {
                    yield* put(
                        didFailToWriteCommand(
                            action.id,
                            new Error('Timed out waiting for response'),
                        ),
                    );
                    console.error('Timed out waiting for USB command response');
                    continue;
                }

                defined(response);

                if (response.statusCode !== 0) {
                    yield* put(
                        didFailToWriteCommand(
                            action.id,
                            new Error(
                                `USB command failed with status code ${response.statusCode}`,
                            ),
                        ),
                    );
                    console.error('USB command failed:', response);
                    continue;
                }

                yield* put(didWriteCommand(action.id));

                continue;
            }

            console.error(`Unknown USB action type: ${action.type}`);
        }
    }

    const sendMessagesTask = yield* fork(sendMessages);
    exitStack.push(async () => sendMessagesTask.cancel());

    yield* put(usbPybricksSubscribe());

    const { didFailToSub } = yield* race({
        didSub: take(usbPybricksDidSubscribe),
        didFailToSub: take(usbPybricksDidFailToSubscribe),
    });

    if (didFailToSub) {
        console.error('Failed to subscribe to USB Pybricks messages:', didFailToSub);
        yield* put(usbDidFailToConnectPybricks());
        yield* cleanup();
        return;
    }

    // TODO: how to push put(usbPybricksUnsubscribe()) on exit stack?

    yield* put(
        usbDidConnectPybricks({
            vendorIdSource: PnpIdVendorIdSource.UsbImpForum,
            vendorId: usbDevice.vendorId,
            productId: usbDevice.productId,
            productVersion: 0,
        }),
    );

    // wait for the user to request disconnecting the USB device or for the
    // USB device to be physically disconnected
    for (;;) {
        const { disconnectRequest, disconnectEvent } = yield* race({
            disconnectRequest: take(usbDisconnectPybricks),
            disconnectEvent: take(disconnectChannel),
        });

        console.debug('USB disconnect request or event received:', {
            disconnectRequest,
            disconnectEvent,
        });

        if (disconnectRequest || disconnectEvent?.device === usbDevice) {
            break;
        }
    }

    yield* put(usbPybricksUnsubscribe());
    yield* race({
        didUnsub: take(usbPybricksDidUnsubscribe),
        didFailToUnsub: take(usbPybricksDidFailToUnsubscribe),
    });
    yield* cleanup();
    yield* put(usbDidDisconnectPybricks());
}

function* handleUsbToggle(): Generator {
    const connectionState = (yield select(
        (s: RootState) => s.usb.connection,
    )) as UsbConnectionState;

    console.debug('Handling USB toggle action, current state:', connectionState);

    switch (connectionState) {
        case UsbConnectionState.Connected:
            yield* put(usbDisconnectPybricks());
            break;
        case UsbConnectionState.Disconnected:
            yield* put(usbConnectPybricks());
            break;
    }
}

function* handleUsbConnectEvent(): Generator {
    if (navigator.usb === undefined) {
        return;
    }

    const [devices, devicesError] = yield* call(() =>
        maybe(navigator.usb.getDevices()),
    );

    if (devicesError) {
        console.error('Failed to get USB devices:', devicesError);
    } else {
        defined(devices);

        const pybricksDevices = devices.filter(
            (d) =>
                d.deviceClass === pybricksUsbClass &&
                d.deviceSubclass === pybricksUsbSubclass &&
                d.deviceProtocol === pybricksUsbProtocol,
        );

        // if there is exactly one Pybricks device connected, we can connect to
        // it, otherwise we should let the user choose which one to connect to
        if (pybricksDevices.length === 1) {
            yield* spawn(handleUsbConnectPybricks, pybricksDevices[0]);
        }
    }

    const channel = eventChannel<USBConnectionEvent>((emitter) => {
        navigator.usb.addEventListener('connect', emitter);
        return () => {
            navigator.usb.removeEventListener('connect', emitter);
        };
    });

    for (;;) {
        const event = yield* take(channel);
        console.log('USB device connected:', event);

        if (
            event.device.deviceClass !== pybricksUsbClass ||
            event.device.deviceSubclass !== pybricksUsbSubclass ||
            event.device.deviceProtocol !== pybricksUsbProtocol
        ) {
            continue;
        }

        const state = yield* select((s: RootState) => s);

        // If we are not already connected, we can connect to the hub that
        // was just connected.
        if (
            state.ble.connection === BleConnectionState.Disconnected &&
            state.usb.connection === UsbConnectionState.Disconnected
        ) {
            yield* spawn(handleUsbConnectPybricks, event.device);
        }
    }
}

function* handleUsbDisconnectEvent(): Generator {
    if (navigator.usb === undefined) {
        return;
    }

    const channel = eventChannel<USBConnectionEvent>((emitter) => {
        navigator.usb.addEventListener('disconnect', emitter);
        return () => {
            navigator.usb.removeEventListener('disconnect', emitter);
        };
    });

    for (;;) {
        const event = yield* take(channel);
        console.log('USB device disconnected:', event);
    }
}

export default function* (): Generator {
    yield* takeEvery(usbConnectPybricks, handleUsbConnectPybricks, undefined);
    yield* takeEvery(usbToggle, handleUsbToggle);
    yield* spawn(handleUsbConnectEvent);
    yield* spawn(handleUsbDisconnectEvent);
}
