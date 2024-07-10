// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { useI18n as useShopifyI18n } from '@shopify/react-i18n';
import type { TypedI18n } from '../i18n';
import type translations from './translations/en.json';

export function useI18n(): TypedI18n<typeof translations> {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useShopifyI18n();
    return i18n;
}
