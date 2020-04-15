import React from 'react';
import Dropzone from 'react-dropzone';

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const legoFirmwareServiceUUID = '00001625-1212-efde-1623-785feabcd123';
const legoFirmwareCharUUID = '00001626-1212-efde-1623-785feabcd123';

enum legoFirmwareCmd {
    eraseFlash = 0x11,
    programFlash = 0x22,
    startApp = 0x33,
    initLoader = 0x44,
    getInfo = 0x55,
    getChecksum = 0x66,
    getFlashState = 0x77,
    disconnect = 0x88,
}

enum legoHubType {
    moveHub = 0x40,
    cityHub = 0x41,
    cplusHub = 0x80,
}

const legoFirmwareError = 0x05;

function createEraseFlashRequest(): Uint8Array {
    const msg = new Uint8Array(1);
    const view = new DataView(msg.buffer);
    view.setUint8(0, legoFirmwareCmd.eraseFlash);
    return msg;
}

function createProgramFlashRequest(address: number, payload: ArrayBuffer): Uint8Array {
    const size = payload.byteLength;
    if (size > 14) {
        throw Error('size too big');
    }
    const msg = new Uint8Array(size + 6);
    const view = new DataView(msg.buffer);
    view.setUint8(0, legoFirmwareCmd.programFlash);
    view.setUint8(1, size + 4);
    view.setUint32(2, address, true);
    const payloadView = new DataView(payload);
    for (let i = 0; i < size; i++) {
        view.setUint8(6 + i, payloadView.getUint8(i));
    }
    return msg;
}

function createStartAppRequest(): Uint8Array {
    const msg = new Uint8Array(1);
    const view = new DataView(msg.buffer);
    view.setUint8(0, legoFirmwareCmd.startApp);
    return msg;
}

function createInitLoaderRequest(fwSize: number): Uint8Array {
    const msg = new Uint8Array(5);
    const view = new DataView(msg.buffer);
    view.setUint8(0, legoFirmwareCmd.initLoader);
    view.setUint32(1, fwSize, true);
    return msg;
}

function createGetInfoRequest(): Uint8Array {
    const msg = new Uint8Array(1);
    const view = new DataView(msg.buffer);
    view.setUint8(0, legoFirmwareCmd.getInfo);
    return msg;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createGetChecksumRequest(): Uint8Array {
    const msg = new Uint8Array(1);
    const view = new DataView(msg.buffer);
    view.setUint8(0, legoFirmwareCmd.getChecksum);
    return msg;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createGetFlashStateRequest(): Uint8Array {
    const msg = new Uint8Array(1);
    const view = new DataView(msg.buffer);
    view.setUint8(0, legoFirmwareCmd.getFlashState);
    return msg;
}

function assertError(msg: DataView): void {
    if (msg.getUint8(0) === legoFirmwareError && msg.getUint8(1) === 5) {
        throw Error(
            `msg type: 0x${msg.getUint8(3).toString(16)} error: 0x${msg
                .getUint8(4)
                .toString(16)}`,
        );
    }
}

function parseEraseFlashReply(msg: DataView): { result: number } {
    assertError(msg);
    if (msg.getUint8(0) !== legoFirmwareCmd.eraseFlash) {
        throw Error('expecting erase flash command');
    }
    return { result: msg.getUint8(1) };
}

function parseProgramFlashReply(msg: DataView): { checksum: number; count: number } {
    assertError(msg);
    if (msg.getUint8(0) !== legoFirmwareCmd.programFlash) {
        throw Error('expecting program flash command');
    }
    return { checksum: msg.getUint8(1), count: msg.getUint32(2, true) };
}

function parseInitLoaderReply(msg: DataView): { result: number } {
    assertError(msg);
    if (msg.getUint8(0) !== legoFirmwareCmd.initLoader) {
        throw Error('expecting init loader command');
    }
    return { result: msg.getUint8(1) };
}

function parseGetInfoReply(
    msg: DataView,
): { version: number; startAddress: number; endAddress: number; typeId: legoHubType } {
    assertError(msg);
    if (msg.getUint8(0) !== legoFirmwareCmd.getInfo) {
        throw Error('expecting get info command');
    }
    return {
        version: msg.getUint32(1, true),
        startAddress: msg.getUint32(5, true),
        endAddress: msg.getUint32(9, true),
        typeId: msg.getUint8(13),
    };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseGetChecksumReply(msg: DataView): { checksum: number } {
    assertError(msg);
    if (msg.getUint8(0) !== legoFirmwareCmd.getChecksum) {
        throw Error('expecting get checksum command');
    }
    return { checksum: msg.getUint8(1) };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function parseGetFlashStateReply(msg: DataView): { level: number } {
    assertError(msg);
    if (msg.getUint8(0) !== legoFirmwareCmd.getFlashState) {
        throw Error('expecting get flash state command');
    }
    return { level: msg.getUint8(1) };
}

function getResponse<T>(
    char: BluetoothRemoteGATTCharacteristic,
    decode: (msg: DataView) => T,
    timeout = 100,
): Promise<T> {
    let handler: EventListener;
    return new Promise<T>((resolve, reject) => {
        handler = (): void => {
            if (char.value === undefined) {
                reject('unexpected undefined value');
            } else {
                resolve(decode(char.value));
            }
        };
        char.addEventListener('characteristicvaluechanged', handler);
        setTimeout(() => reject('timed out'), timeout);
    }).finally(() => {
        char.removeEventListener('characteristicvaluechanged', handler);
    });
}

async function sendRequest(
    char: BluetoothRemoteGATTCharacteristic,
    msg: BufferSource,
): Promise<void> {
    return char.writeValue(msg);
}

class Flash extends React.Component {
    constructor(props: {}) {
        super(props);
        this.onDropAccepted = this.onDropAccepted.bind(this);
        this.onDropRejected = this.onDropRejected.bind(this);
    }

    private async flash(data: ArrayBuffer): Promise<void> {
        if (navigator.bluetooth === undefined) {
            throw Error('No web bluetooth');
        }
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ services: [legoFirmwareServiceUUID] }],
        });
        if (device.gatt === undefined) {
            throw Error('Device does not support GATT');
        }
        device.addEventListener('gattserverdisconnected', () => {
            // this.setState({ connection: connectionState.disconnected });
        });
        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(legoFirmwareServiceUUID);
        const char = await service.getCharacteristic(legoFirmwareCharUUID);
        char.addEventListener('characteristicvaluechanged', () => {
            if (!char.value) {
                return;
            }
            // this.props.onData(new Uint8Array(char.value.buffer));
        });
        await char.startNotifications();

        console.log('Getting info');
        await sendRequest(char, createGetInfoRequest());
        const info = await getResponse(char, parseGetInfoReply);
        console.log(
            `version: ${info.version.toString(
                16,
            )} startAddress: ${info.startAddress.toString(
                16,
            )} endAddress: ${info.endAddress.toString(
                16,
            )} typeId: ${info.typeId.toString(16)}`,
        );
        // TODO: verify typeId === firmware.typeId

        console.log('Erasing flash');
        await sendRequest(char, createEraseFlashRequest());
        const eraseResult = await getResponse(char, parseEraseFlashReply, 5000);
        if (eraseResult.result) {
            throw Error('Failed to erase');
        }

        console.log('Initializing');
        await sendRequest(char, createInitLoaderRequest(data.byteLength));
        const initResult = await getResponse(char, parseInitLoaderReply);
        if (initResult.result) {
            throw Error('Failed to init');
        }

        // TODO: we can receive an async error message during this loop
        // in which case it would be better to abort early rather than waiting
        // for all messages to be sent
        for (let offset = 0; offset < data.byteLength; offset += 14) {
            console.log(`sending ${offset / 14 + 1} of ${data.byteLength / 14}`);
            const payload = data.slice(offset, offset + 14);
            await sendRequest(
                char,
                createProgramFlashRequest(info.startAddress + offset, payload),
            );

            // unfortunately there is not a way to get backpressure from BLE
            // so we just have to add a delay to avoid buffer overrun on the
            // remote device and it has to be slow enough to work in the worst
            // conditions
            await sleep(10);
        }

        console.log('waiting for confirmation');
        const flashResult = await getResponse(char, parseProgramFlashReply, 5000);
        if (flashResult.count !== data.byteLength) {
            throw Error("Didn't flash all bytes");
        }

        // this will cause the remote device to disconnect and reboot
        console.log('restarting');
        await sendRequest(char, createStartAppRequest());
    }

    private onDropAccepted(acceptedFiles: File[]): void {
        // should only be one file since multiple={false}
        acceptedFiles.forEach((f) => {
            const reader = new FileReader();

            reader.onabort = (): void => console.log('file reading was aborted');
            reader.onerror = (): void => console.log('file reading has failed');
            reader.onload = (): void => {
                // Do whatever you want with the file contents
                const binaryStr = reader.result;
                if (binaryStr === null) {
                    throw Error('Unexpected null binaryStr');
                }
                if (typeof binaryStr === 'string') {
                    throw Error('Unexpected string binaryStr');
                }
                this.flash(binaryStr);
            };
            reader.readAsArrayBuffer(f);
        });
    }

    private onDropRejected(rejectedFiles: File[]): void {
        // should only be one file since multiple={false}
        rejectedFiles.forEach((f) => {
            alert(`bad file ${f.name}`);
        });
    }

    render(): JSX.Element {
        return (
            <Dropzone
                onDropAccepted={this.onDropAccepted}
                onDropRejected={this.onDropRejected}
                accept=".bin"
                multiple={false}
            >
                {({ getRootProps, getInputProps }): JSX.Element => (
                    <section>
                        <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <p>
                                Drag and drop a firmware file here, or click to select a
                                file
                            </p>
                        </div>
                    </section>
                )}
            </Dropzone>
        );
    }
}

export { Flash };
