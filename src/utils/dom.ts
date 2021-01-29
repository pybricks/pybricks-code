// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// Chromium-only API
// https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
export interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}
