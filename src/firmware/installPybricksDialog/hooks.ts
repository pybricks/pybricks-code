// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors
// based on https://usehooks-ts.com/react-hook/use-fetch

import { FirmwareMetadata, FirmwareReader } from '@pybricks/firmware';
import cityHubZip from '@pybricks/firmware/build/cityhub.zip';
import essentialHubZip from '@pybricks/firmware/build/essentialhub.zip';
import moveHubZip from '@pybricks/firmware/build/movehub.zip';
import primeHubZip from '@pybricks/firmware/build/primehub.zip';
import technicHubZip from '@pybricks/firmware/build/technichub.zip';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useIsMounted } from 'usehooks-ts';
import { alertsShowAlert } from '../../alerts/actions';
import { Hub } from '../../components/hubPicker';
import { ensureError } from '../../utils';

export type FirmwareData = {
    firmwareZip: ArrayBuffer;
    licenseText: string;
    metadata: FirmwareMetadata;
};

interface State {
    /** The firmware.zip data or undefined if `fetch()` is not complete or on error. */
    firmwareData?: FirmwareData;
    /** Undefined `fetch()` is not complete yet or was successful, otherwise the error. */
    firmwareError?: Error;
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
        firmwareError: undefined,
        firmwareData: undefined,
    };

    // Keep state logic separated
    const fetchReducer = (state: State, action: Action): State => {
        switch (action.type) {
            case 'loading':
                return { ...initialState };
            case 'fetched':
                return { ...initialState, firmwareData: action.payload };
            case 'error':
                return { ...initialState, firmwareError: action.payload };
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
                const metadata = await reader.readMetadata();
                const data = { firmwareZip, licenseText, metadata };

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

                dispatch({ type: 'error', payload: ensureError(error) });
            }
        };

        void fetchData();
    }, [url, isMounted]);

    return state;
}

/**
 * Gets the data from the user-provided firmware file, if any.
 * @param zipFile The user-provided zip file.
 * @returns State consisting of unzipped data or error.
 */
export function useCustomFirmware(zipFile: File | undefined) {
    const reduxDispatch = useDispatch();
    const isMounted = useIsMounted();

    const initialState: State = {
        firmwareError: undefined,
        firmwareData: undefined,
    };

    // Keep state logic separated
    const fetchReducer = (state: State, action: Action): State => {
        switch (action.type) {
            case 'loading':
                return { ...initialState };
            case 'fetched':
                return { ...initialState, firmwareData: action.payload };
            case 'error':
                return { ...initialState, firmwareError: action.payload };
            default:
                return state;
        }
    };

    const [state, dispatch] = useReducer(fetchReducer, initialState);

    useEffect(() => {
        if (!zipFile) {
            dispatch({ type: 'loading' });
            return;
        }

        // REVISIT: with no cache, we end up unzipping the same file multiple times.

        const readFile = async () => {
            dispatch({ type: 'loading' });

            try {
                const firmwareZip = await zipFile.arrayBuffer();
                const reader = await FirmwareReader.load(firmwareZip);
                const licenseText = await reader.readReadMeOss();
                const metadata = await reader.readMetadata();
                const data = {
                    firmwareZip,
                    licenseText,
                    metadata,
                };

                if (!isMounted()) {
                    return;
                }

                dispatch({ type: 'fetched', payload: data });
            } catch (err) {
                if (process.env.NODE_ENV !== 'test') {
                    console.error(err);
                }

                if (!isMounted()) {
                    return;
                }

                const error = ensureError(err);
                dispatch({ type: 'error', payload: error });
                reduxDispatch(alertsShowAlert('alerts', 'unexpectedError', { error }));
            }
        };

        readFile();
    }, [zipFile, isMounted, reduxDispatch]);

    const isCustomFirmwareRequested = useMemo(
        () => state.firmwareData !== undefined,
        [state.firmwareData],
    );

    return {
        isCustomFirmwareRequested,
        customFirmwareData: state.firmwareData,
        customFirmwareError: state.firmwareError,
    };
}
