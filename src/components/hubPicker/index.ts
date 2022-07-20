// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

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
}

/**
 * Tests if hub has a USB port.
 */
export function hubHasUSB(hub: Hub): boolean {
    switch (hub) {
        case Hub.Prime:
        case Hub.Essential:
        case Hub.Inventor:
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
            return true;
        default:
            return false;
    }
}
