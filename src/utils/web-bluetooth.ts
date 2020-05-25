// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

/**
 * Current definition of BluetoothRemoteGATTCharacteristic doesn't include
 * new Web Bluetooth APIs.
 */
export interface PolyfillBluetoothRemoteGATTCharacteristic
    extends BluetoothRemoteGATTCharacteristic {
    writeValueWithResponse?(value: BufferSource): Promise<void>;
    writeValueWithoutResponse?(value: BufferSource): Promise<void>;
    /**
     * Calls writeValueWithResponse() if available otherwise falls back to writeValue()
     * @param value data to send
     */
    xWriteValueWithResponse(value: BufferSource): Promise<void>;
    /**
     * Calls writeValueWithoutResponse() if available otherwise falls back to writeValue()
     * @param value data to send
     */
    xWriteValueWithoutResponse(value: BufferSource): Promise<void>;
}

/**
 * Fills in writeValueWithResponse and writeValueWithoutResponse for backward
 * compatibility.
 * @param char a remote GATT characteristic object
 */
export function polyfillBluetoothRemoteGATTCharacteristic(
    char: BluetoothRemoteGATTCharacteristic,
): PolyfillBluetoothRemoteGATTCharacteristic {
    const polyfill = (char as unknown) as PolyfillBluetoothRemoteGATTCharacteristic;
    polyfill.xWriteValueWithResponse =
        polyfill.writeValueWithResponse || char.writeValue;
    polyfill.xWriteValueWithoutResponse =
        polyfill.writeValueWithoutResponse || char.writeValue;
    return polyfill;
}
