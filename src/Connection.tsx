import React from 'react';

const pybricksServiceUUID = 'c5f50001-8280-46da-89f4-6d8051e4aeef';
const bleNusServiceUUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharRXUUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const bleNusCharTXUUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

enum connectionState {
    disconnected,
    connecting,
    connected,
    disconnecting,
}

function connectionStateToButtonText(state: connectionState): string {
    switch (state) {
        case connectionState.disconnected:
            return 'Connect';
        case connectionState.connecting:
            return 'Connecting...';
        case connectionState.connected:
            return 'Disconnect';
        case connectionState.disconnecting:
            return 'Disconnecting...';
        default:
            return 'Error';
    }
}

type ConnectionProperties = {
    onData: (data: Uint8Array) => void;
};
type ConnectionState = {
    connection: connectionState;
};

class Connection extends React.Component<ConnectionProperties, ConnectionState> {
    private device?: BluetoothDevice;
    private rxChar?: BluetoothRemoteGATTCharacteristic;

    constructor(props: ConnectionProperties) {
        super(props);
        this.state = { connection: connectionState.disconnected };
        this.onConnectClicked = this.onConnectClicked.bind(this);
    }

    public write(data: Uint8Array): void {
        this.rxChar?.writeValue(data);
    }

    private async connect(): Promise<void> {
        try {
            if (this.device !== undefined) {
                throw Error('Already connected.');
            }
            if (navigator.bluetooth === undefined) {
                // TODO: custom exception type
                throw Error(
                    'WebBluetooth API is not available. Please make sure the Web Bluetooth flag is enabled.',
                );
            }
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [pybricksServiceUUID] }],
            });
            if (this.device.gatt === undefined) {
                throw Error('Device does not support GATT');
            }
            this.device.addEventListener('gattserverdisconnected', () =>
                this.setState({ connection: connectionState.disconnected }),
            );
        } catch (err) {
            this.setState({ connection: connectionState.disconnected });
            throw err;
        }
        const server = await this.device.gatt.connect();
        const service = await server.getPrimaryService(bleNusServiceUUID);
        this.rxChar = await service.getCharacteristic(bleNusCharRXUUID);
        const txChar = await service.getCharacteristic(bleNusCharTXUUID);
        txChar.addEventListener('characteristicvaluechanged', () => {
            if (!txChar.value) {
                return;
            }
            this.props.onData(new Uint8Array(txChar.value.buffer));
        });
        await txChar.startNotifications();
        this.setState({ connection: connectionState.connected });
    }

    private disconnect(): void {
        if (this.device !== undefined) {
            this.device.gatt?.disconnect();
            this.device = undefined;
            this.rxChar = undefined;
        }
    }

    private async onConnectClicked(): Promise<void> {
        if (this.state.connection === connectionState.disconnected) {
            this.setState({ connection: connectionState.connecting });
            try {
                await this.connect();
            } catch (err) {
                // FIXME: need proper error dialog
                alert(err);
            }
        } else {
            this.setState({ connection: connectionState.disconnecting });
            try {
                this.disconnect();
            } catch (err) {
                // FIXME: need proper error dialog
                alert(err);
            }
        }
    }

    render(): JSX.Element {
        return (
            <button
                name="connect"
                onClick={this.onConnectClicked}
                disabled={
                    this.state.connection === connectionState.connecting ||
                    this.state.connection === connectionState.disconnecting
                }
            >
                {connectionStateToButtonText(this.state.connection)}
            </button>
        );
    }
}

export { Connection };
