// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors
// based on https://usehooks-ts.com/react-hook/use-fetch

import { FirmwareReader } from '@pybricks/firmware';
import cityHubZip from '@pybricks/firmware/build/cityhub.zip';
import essentialHubZip from '@pybricks/firmware/build/essentialhub.zip';
import moveHubZip from '@pybricks/firmware/build/movehub.zip';
import primeHubZip from '@pybricks/firmware/build/primehub.zip';
import technicHubZip from '@pybricks/firmware/build/technichub.zip';
import { useEffect, useReducer, useRef } from 'react';
import { useIsMounted } from 'usehooks-ts';
import { Hub } from '../../components/hubPicker';

type FirmwareData = {
    firmwareZip: ArrayBuffer;
    licenseText: string;
};

interface State {
    /** The firmware.zip data or undefined if `fetch()` is not complete or on error. */
    data?: FirmwareData;
    /** Undefined `fetch()` is not complete yet or was successful, otherwise the error. */
    error?: Error;
}

type Cache = { [url: string]: FirmwareData };

// discriminated union type
type Action =
    | { type: 'loading' }
    | { type: 'fetched'; payload: FirmwareData }
    | { type: 'error'; payload: Error };

const firmwareZipMap = new Map<Hub, string>([
    [Hub.Move, moveHubZip],
    [Hub.City, cityHubZip],
    [Hub.Technic, technicHubZip],
    [Hub.Prime, primeHubZip],
    [Hub.Essential, essentialHubZip],
    [Hub.Inventor, primeHubZip],
]);

/**
 * Gets Pybricks firmware .zip file for the specified hub type.
 * @param hubType The hub type.
 * @returns The current state.
 */
export function useFirmware(hubType: Hub): State {
    const url = firmwareZipMap.get(hubType);
    const cache = useRef<Cache>({});
    const isMounted = useIsMounted();

    const initialState: State = {
        error: undefined,
        data: undefined,
    };

    // Keep state logic separated
    const fetchReducer = (state: State, action: Action): State => {
        switch (action.type) {
            case 'loading':
                return { ...initialState };
            case 'fetched':
                return { ...initialState, data: action.payload };
            case 'error':
                return { ...initialState, error: action.payload };
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(fetchReducer, initialState);

    useEffect(() => {
        // Do nothing if the url is not given
        if (!url) {
            return;
        }

        const fetchData = async () => {
            dispatch({ type: 'loading' });

            // If a cache exists for this url, return it
            if (cache.current[url]) {
                dispatch({ type: 'fetched', payload: cache.current[url] });
                return;
            }

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(response.statusText);
                }

                const firmwareZip = await response.arrayBuffer();
                const reader = await FirmwareReader.load(firmwareZip);
                const licenseText = await reader.readReadMeOss();
                const data = { firmwareZip, licenseText };

                cache.current[url] = data;

                if (!isMounted()) {
                    return;
                }

                dispatch({ type: 'fetched', payload: data });
            } catch (error) {
                if (process.env.NODE_ENV !== 'test') {
                    console.error(error);
                }

                if (!isMounted()) {
                    return;
                }

                dispatch({ type: 'error', payload: error as Error });
            }
        };

        void fetchData();
    }, [url, isMounted]);

    return state;
}
