// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import {
    HubType,
    LegoCompanyId,
    TechnicLargeHubVariant,
} from '../ble-lwp3-service/protocol';
import { decodePnpId, getHubTypeName } from './protocol';

export function encodeInfo(id: HubType, variant?: number) {
    return new DataView(
        new Uint8Array([
            1, // Bluetooth SIG
            LegoCompanyId & 0xff,
            LegoCompanyId >> 8,
            id,
            0,
            variant ?? 0,
            0,
        ]).buffer,
    );
}

test.each([
    [encodeInfo(HubType.MoveHub), 'Move hub'],
    [encodeInfo(HubType.CityHub), 'City hub'],
    [encodeInfo(HubType.TechnicHub), 'Technic hub'],
    [
        encodeInfo(HubType.TechnicLargeHub, TechnicLargeHubVariant.SpikePrimeHub),
        'Prime hub',
    ],
    [
        encodeInfo(
            HubType.TechnicLargeHub,
            TechnicLargeHubVariant.MindstormsInventorHub,
        ),
        'Inventor hub',
    ],
    [encodeInfo(HubType.TechnicSmallHub), 'Essential hub'],
])('should correctly decode data', (data, expected) => {
    expect(getHubTypeName(decodePnpId(data))).toBe(expected);
});
