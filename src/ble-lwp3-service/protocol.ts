// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors
//
// Constants and helper functions for LEGO Wireless protocol v3.
//
// https://lego.github.io/lego-ble-wireless-protocol-docs/

/**
 * LEGO's Bluetooth SIG company identifier.
 *
 * https://www.bluetooth.com/specifications/assigned-numbers/company-identifiers/
 */
export const LegoCompanyId = 0x0397;

/**
 * LEGO Powered Up Hub type IDs
 *
 * https://github.com/pybricks/technical-info/blob/master/assigned-numbers.md#hub-type-ids
 */
export enum HubType {
    /** WeDo 2.0 uses different protocol so shouldn't be seen in LWP3. */
    WeDo2Hub = 0x00,
    /** Duplo train hub. */
    DuploTrainHub = 0x20,
    /** BOOST Move hub.  */
    MoveHub = 0x40,
    /** 2-port System hub. */
    CityHub = 0x41,
    /** Remote Control. */
    Handset = 0x42,
    /** Mario minifig. */
    Mario = 0x43,
    /** Luigi minifig. */
    Luigi = 0x44,
    /** 4-port Technic hub. */
    TechnicHub = 0x80,
    /** 6-port SPIKE/MINDSTORMS hub. */
    TechnicLargeHub = 0x81,
    /** 2-port SPIKE hub. */
    TechnicSmallHub = 0x83,
}

/**
 * Variants of the 6-port Technic Large hub.
 */
export enum TechnicLargeHubVariant {
    /** Yellow SPIKE Prime variant. */
    SpikePrimeHub = 0,
    /** Teal MINDSTORMS Robot Inventor variant. */
    MindstormsInventorHub = 1,
}

/**
 * Variants of the 2-port Technic Small hub.
 */
export enum TechnicSmallHubVariant {
    /** Yellow SPIKE Essential variant. */
    SpikeEssentialHub = 0,
}
