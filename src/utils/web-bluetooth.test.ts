import { polyfillBluetoothRemoteGATTCharacteristic } from './web-bluetooth';

describe('polyfillBluetoothRemoteGATTCharacteristic', () => {
    test('old browser falls back to writeValue', () => {
        const char = {} as BluetoothRemoteGATTCharacteristic;
        Object.defineProperty(char, 'writeValue', { value: 'writeValue' });
        expect(polyfillBluetoothRemoteGATTCharacteristic(char)).toEqual({
            xWriteValueWithResponse: 'writeValue',
            xWriteValueWithoutResponse: 'writeValue',
        });
    });
    test('new browser uses writeValueWith(out)Response', () => {
        const char = {} as BluetoothRemoteGATTCharacteristic;
        Object.defineProperty(char, 'writeValue', { value: 'writeValue' });
        Object.defineProperty(char, 'writeValueWithResponse', {
            value: 'writeValueWithResponse',
        });
        Object.defineProperty(char, 'writeValueWithoutResponse', {
            value: 'writeValueWithoutResponse',
        });
        expect(polyfillBluetoothRemoteGATTCharacteristic(char)).toEqual({
            xWriteValueWithResponse: 'writeValueWithResponse',
            xWriteValueWithoutResponse: 'writeValueWithoutResponse',
        });
    });
});
