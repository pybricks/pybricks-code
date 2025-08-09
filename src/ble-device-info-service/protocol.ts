// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2025 The Pybricks Authors
//
// Pybricks uses the standard Device Info service.
// Refer to Device Information Service (DIS) at https://www.bluetooth.com/specifications/specs/
// and assigned numbers at https://www.bluetooth.com/specifications/assigned-numbers/

import {
    HubType,
    LegoCompanyId,
    TechnicLargeHubVariant,
    TechnicSmallHubVariant,
} from '../ble-lwp3-service/protocol';

/** Device Information service UUID. */
export const deviceInformationServiceUUID = 0x180a;

/**
 * Device Name characteristic UUID.
 *
 * NB: Some OSes block this, so we just get the device name from the BLE
 * advertisement data instead. But we need this UUID for USB support.
 */
export const deviceNameUUID = 0x2a00;

/** Firmware Revision String characteristic UUID. */
export const firmwareRevisionStringUUID = 0x2a26;

/** Software Revision String characteristic UUID. */
export const softwareRevisionStringUUID = 0x2a28;

/** PnP ID characteristic UUID. */
export const pnpIdUUID = 0x2a50;

/**
 * Parameters for the PnP ID characteristic vendor ID source field.
 */
export enum PnpIdVendorIdSource {
    /** The vendor ID was assigned by the Bluetooth SIG. */
    BluetoothSig = 1,
    /** The vendor and product IDs were assigned by the USB implementors forum. */
    UsbImpForum = 2,
}

/**
 * Decoded data from the PnP ID characteristic.
 */
export type PnpId = {
    /** For Pybricks hubs, this should be PnpIdVendorIdSource.BluetoothSig */
    vendorIdSource: PnpIdVendorIdSource;
    /** For Pybricks hubs, this should be LegoCompanyId (from ble-lwp3-service/protocol). */
    vendorId: number;
    /** For Pybricks hubs, this should be one of HubType (from ble-lwp3-service/protocol). */
    productId: number;
    /** For Pybricks hubs, this should be hub variant if applicable (from ble-lwp3-service/protocol). */
    productVersion: number;
};

/**
 * Decodes data read from the PnP ID characteristics.
 * @param data The data read from the characteristic.
 * @returns The decoded data.
 */
export function decodePnpId(data: DataView): PnpId {
    return {
        vendorIdSource: data.getUint8(0),
        vendorId: data.getUint16(1, true),
        productId: data.getUint16(3, true),
        productVersion: data.getUint16(5, true),
    };
}

/**
 * Returns hub type as a string suitable for display to users.
 * @param pnpId The PnP ID
 */
export function getHubTypeName(pnpId: PnpId): string {
    if (pnpId.vendorIdSource !== PnpIdVendorIdSource.BluetoothSig) {
        return 'USB';
    }

    if (pnpId.vendorId !== LegoCompanyId) {
        return 'non-LEGO';
    }

    switch (pnpId.productId) {
        case HubType.MoveHub:
            return 'Move hub';
        case HubType.CityHub:
            return 'City hub';
        case HubType.TechnicHub:
            return 'Technic hub';
        case HubType.TechnicLargeHub:
            switch (pnpId.productVersion) {
                case TechnicLargeHubVariant.SpikePrimeHub:
                    return 'Prime hub';
                case TechnicLargeHubVariant.MindstormsInventorHub:
                    return 'Inventor hub';
            }
            break;
        case HubType.TechnicSmallHub:
            switch (pnpId.productVersion) {
                case TechnicSmallHubVariant.SpikeEssentialHub:
                    return 'Essential hub';
            }
            break;
    }

    return 'Unsupported';
}
