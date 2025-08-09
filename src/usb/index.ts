// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2025 The Pybricks Authors

// https://github.com/pybricks/technical-info/blob/master/assigned-numbers.md#usb

/** Official LEGO USB Vendor ID (VID) */
export const legoUsbVendorId = 0x0694;

/** Official LEGO USB Product IDs (PID) */
export enum LegoUsbProductId {
    /** MINDSTORMS RCX IR Tower. */
    RcxIrTower = 0x0001,
    /** MINDSTORMS NXT */
    Nxt = 0x0002,
    /** WeDo USB hub. */
    WedoUsb = 0x0003,
    /** MINDSTORMS EV3 */
    Ev3 = 0x0005,
    /** MINDSTORMS EV3 in firmware update (bootloader) mode. */
    Ev3Bootloader = 0x0006,
    /** SPIKE Prime hub in DFU (bootloader) mode. */
    SpikePrimeBootloader = 0x0008,
    /** SPIKE Prime hub. */
    SpikePrime = 0x0009,
    /** SPIKE Essential hub in DFU (bootloader) mode. */
    SpikeEssentialBootloader = 0x000c,
    /** SPIKE Essential hub. */
    SpikeEssential = 0x000d,
    /** MINDSTORMS Robot inventor hub. */
    MindstormsRobotInventor = 0x0010,
    /** MINDSTORMS Robot inventor hub in DFU (bootloader) mode. */
    MindstormsRobotInventorBootloader = 0x0011,
}

/** USB bDeviceClass for Pybricks hubs */
export const pybricksUsbClass = 0xff;
/** USB bDeviceSubClass for Pybricks hubs */
export const pybricksUsbSubclass = 0xc5;
/** USB bDeviceProtocol for Pybricks hubs */
export const pybricksUsbProtocol = 0xf5;

/** Maximum data length for {@link PybricksUsbInterfaceRequest}s */
export const pybricksUsbRequestMaxLength = 20;

/**
 * bRequest values for Pybricks USB interface control requests.
 */
export enum PybricksUsbInterfaceRequest {
    /** Analogous to standard BLE GATT attributes. */
    Gatt = 0x01,
    /** Analogous to Pybricks BLE characteristics. */
    Pybricks = 0x02,
}

/**
 * Extracts a 16-bit UUID from a 128-bit UUID string.
 * @param uuid A 128-bit UUID string in the format "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".
 * @returns The extracted 16-bit UUID as a number.
 */
export function uuid16(uuid: string): number {
    // Convert a 128-bit UUID string to a 16-bit UUID number.
    const hex = uuid.slice(4, 8);
    return parseInt(hex, 16);
}

/** Hub to host messages via the Pybricks interface IN endpoint. */
export enum PybricksUsbInEndpointMessageType {
    /**
     * Analog of BLE status response. Emitted in response to every OUT message
     * received.
     */
    Response = 1,
    /**Analog to BLE notification. Only emitted if subscribed. */
    Event = 2,
}

/** Host to hub messages via the Pybricks USB interface OUT endpoint. */
export enum PybricksUsbOutEndpointMessageType {
    /** Analog of BLE Client Characteristic Configuration Descriptor (CCCD). */
    Subscribe = 1,
    /** Analog of BLE Client Characteristic Write with response. */
    Command = 2,
}
