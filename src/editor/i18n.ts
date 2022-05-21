// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors
//
// Editor translation keys.

import { I18n, useI18n as useShopifyI18n } from '@shopify/react-i18n';

export function useI18n(): I18n {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useShopifyI18n();
    return i18n;
}

export enum I18nId {
    Placeholder = 'placeholder',
    Check = 'check',
    ToggleDocs = 'toggleDocs',
    Copy = 'copy',
    Paste = 'paste',
    SelectAll = 'selectAll',
    Undo = 'undo',
    Redo = 'redo',
    CloseFileTooltip = 'closeFile.tooltip',
    ContextMenuLabel = 'contextMenu.label',
}
