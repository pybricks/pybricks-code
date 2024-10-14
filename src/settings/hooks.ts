// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2024 The Pybricks Authors

import { useCallback, useEffect } from 'react';
import { useEffectOnce, useLocalStorage, useSessionStorage } from 'usehooks-ts';

/** Hook for "showDocs" setting. */
export function useSettingIsShowDocsEnabled(): {
    isSettingShowDocsEnabled: boolean;
    setIsSettingShowDocsEnabled: (value: boolean) => void;
    toggleIsSettingShowDocsEnabled: () => void;
} {
    const [isLastSettingShowDocsEnabled, setIsLastSettingShowDocsEnabled] =
        useLocalStorage('setting.showDocs', window.innerWidth >= 1024);

    const [isSettingShowDocsEnabled, setIsSettingShowDocsEnabled] = useSessionStorage(
        'setting.showDocs',
        isLastSettingShowDocsEnabled,
    );

    // Force writing to session storage since default value is not constant.
    useEffectOnce(() => setIsSettingShowDocsEnabled(isSettingShowDocsEnabled));

    useEffect(() => {
        setIsLastSettingShowDocsEnabled(isSettingShowDocsEnabled);
    }, [isSettingShowDocsEnabled, setIsLastSettingShowDocsEnabled]);

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

/** Hook for "showTerminal" setting. */
export function useSettingIsShowTerminalEnabled(): {
    isSettingShowTerminalEnabled: boolean;
    setIsSettingShowTerminalEnabled: (value: boolean) => void;
    toggleIsSettingShowTerminalEnabled: () => void;
} {
    const [isLastSettingShowTerminalEnabled, setIsLastSettingShowTerminalEnabled] =
        useLocalStorage('setting.showTerminal', window.innerHeight >= 1024);

    const [isSettingShowTerminalEnabled, setIsSettingShowTerminalEnabled] =
        useSessionStorage('setting.showTerminal', isLastSettingShowTerminalEnabled);

    // Force writing to session storage since default value is not constant.
    useEffectOnce(() => setIsSettingShowTerminalEnabled(isSettingShowTerminalEnabled));

    useEffect(() => {
        setIsLastSettingShowTerminalEnabled(isSettingShowTerminalEnabled);
    }, [isSettingShowTerminalEnabled, setIsLastSettingShowTerminalEnabled]);

    const toggleIsSettingShowTerminalEnabled = useCallback(
        () => setIsSettingShowTerminalEnabled((x) => !x),
        [setIsSettingShowTerminalEnabled],
    );

    return {
        isSettingShowTerminalEnabled,
        setIsSettingShowTerminalEnabled,
        toggleIsSettingShowTerminalEnabled,
    };
}
