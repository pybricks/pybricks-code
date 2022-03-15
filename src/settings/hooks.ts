// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Dispatch, SetStateAction, useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';

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
