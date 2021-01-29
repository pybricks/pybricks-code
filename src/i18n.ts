// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { I18nManager } from '@shopify/react-i18n';

// TODO: add locale setting and use browser preferred language as default

/** The global i18n manager. */
export const i18nManager = new I18nManager({
    locale: 'en',
    onError: (err): void => console.error(err),
});

/** Enables or disables pseudolocalization for development. */
export function pseudolocalize(pseudolocalize: boolean): void {
    i18nManager.update({ ...i18nManager.details, pseudolocalize });
}
