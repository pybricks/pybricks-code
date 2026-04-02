// SPDX-License-Identifier: MIT
// Copyright (c) 2025 The Pybricks Authors

import { useI18n as useShopifyI18n } from '@shopify/react-i18n';
import type { TypedI18n } from '../../../i18n';

type Translations = {
    label: string;
    tooltip: {
        show: string;
        hide: string;
    };
};

export function useI18n(): TypedI18n<Translations> {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useShopifyI18n();
    return i18n;
}
