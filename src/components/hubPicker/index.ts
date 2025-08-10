// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2025 The Pybricks Authors

/** Supported hub types. */
export enum Hub {
    /** BOOST Move hub */
    Move = 'movehub',
    /** City hub */
    City = 'cityhub',
    /** Technic hub */
    Technic = 'technichub',
    /** MINDSTORMS Robot Inventor hub */
    Inventor = 'inventorhub',
    /** SPIKE Prime hub */
    Prime = 'primehub',
    /** SPIKE Essential hub */
    Essential = 'essentialhub',
    /** MINDSTORMS EV3 hub */
    EV3 = 'ev3',
}

/**
 * Tests if hub has a USB port.
 */
export function hubHasUSB(hub: Hub): boolean {
    switch (hub) {
        case Hub.Prime:
        case Hub.Essential:
        case Hub.Inventor:
        case Hub.EV3:
            return true;
        default:
            return false;
    }
}

/**
 * Tests if hub has a Bluetooth button.
 */
export function hubHasBluetoothButton(hub: Hub): boolean {
    switch (hub) {
        case Hub.Prime:
        case Hub.Inventor:
            return true;
        default:
            return false;
    }
}

/**
 * Tests if hub has external flash memory.
 */
export function hubHasExternalFlash(hub: Hub): boolean {
    switch (hub) {
        case Hub.Prime:
        case Hub.Essential:
        case Hub.Inventor:
        case Hub.EV3:
            return true;
        default:
            return false;
    }
}

/** Gets the bootloader type for the hub. */
export function hubBootloaderType(hub: Hub) {
    switch (hub) {
        case Hub.Prime:
        case Hub.Essential:
        case Hub.Inventor:
            return 'usb-lego-dfu';
        case Hub.Move:
        case Hub.City:
        case Hub.Technic:
            return 'ble-lwp3-bootloader';
        case Hub.EV3:
            return 'usb-ev3';
    }
}
