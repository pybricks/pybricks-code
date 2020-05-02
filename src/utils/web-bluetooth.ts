/**
 * Current definition of BluetoothRemoteGATTCharacteristic doesn't include
 * new Web Bluetooth APIs.
 */
export interface PolyfillBluetoothRemoteGATTCharacteristic
    extends BluetoothRemoteGATTCharacteristic {
    writeValueWithResponse(value: BufferSource): Promise<void>;
    writeValueWithoutResponse(value: BufferSource): Promise<void>;
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
    if (!polyfill.writeValueWithResponse) {
        polyfill.writeValueWithResponse = char.writeValue;
    }
    if (!polyfill.writeValueWithoutResponse) {
        polyfill.writeValueWithoutResponse = char.writeValue;
    }
    return polyfill;
}
