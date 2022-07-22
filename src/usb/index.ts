// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

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
