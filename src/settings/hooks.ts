// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Dispatch, SetStateAction, useCallback } from 'react';
import { useIsFirstRender, useLocalStorage } from 'usehooks-ts';

const encoder = new TextEncoder();

// this is private type from usehooks-ts
type SetValue<T> = Dispatch<SetStateAction<T>>;

/** Hook for "showDocs" setting. */
export function useSettingIsShowDocsEnabled(): {
    isSettingShowDocsEnabled: boolean;
    setIsSettingShowDocsEnabled: (value: boolean) => void;
    toggleIsSettingShowDocsEnabled: () => void;
} {
    const [isSettingShowDocsEnabled, setIsSettingShowDocsEnabled] = useLocalStorage(
        'setting.showDocs',
        window.innerWidth >= 1024,
    );

    const toggleIsSettingShowDocsEnabled = useCallback(
        () => setIsSettingShowDocsEnabled((x) => !x),
        [setIsSettingShowDocsEnabled],
    );

    return {
        isSettingShowDocsEnabled,
        setIsSettingShowDocsEnabled,
        toggleIsSettingShowDocsEnabled,
    };
}

/** Hook for "flashCurrentProgram" setting. */
export function useSettingFlashCurrentProgram(): [boolean, SetValue<boolean>] {
    return useLocalStorage<boolean>('setting.flashCurrentProgram', false);
}

/**
 * Validates the hub name.
 * @param hubName The hub name.
 * @returns True if the name if valid, otherwise false.
 */
function validateHubName(hubName: string): boolean {
    const encoded = encoder.encode(hubName);

    // Technically, the max hub name size is determined by each individual
    // firmware file, so we can't check until the firmware has been selected.
    // However all firmware currently have 16 bytes allocated (including zero-
    // termination), so we can hard code the check here to allow notifying the
    // user earlier for better UX.
    return encoded.length < 16;
}

/** Hook for "hubName" setting. */
export function useSettingHubName(): {
    hubName: string;
    isHubNameValid: boolean;
    setHubName: (value: string) => void;
} {
    if (useIsFirstRender()) {
        // in version 1.x, settings didn't use json format, so we have to migrate
        const oldSetting = localStorage.getItem('setting.hubName');

        if (oldSetting !== null && !oldSetting.startsWith('"')) {
            localStorage.setItem('setting.hubName', JSON.stringify(oldSetting));
        }
    }

    const [hubName, setHubName] = useLocalStorage('setting.hubName', '');

    const isHubNameValid = validateHubName(hubName);

    return { hubName, isHubNameValid, setHubName };
}
