// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';

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
