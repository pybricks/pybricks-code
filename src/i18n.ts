// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import { I18n, I18nManager, TranslateOptions } from '@shopify/react-i18n';
import type {
    ComplexReplacementDictionary,
    PrimitiveReplacementDictionary,
    TranslationDictionary,
} from '@shopify/react-i18n/build/ts/types';

// TODO: add locale setting and use browser preferred language as default

/** The global i18n manager. */
export const i18nManager = new I18nManager({
    locale: 'en',
    onError: (err): void => console.error(err),
});

// istanbul ignore next
/** Enables or disables pseudolocalization for development. */
export function pseudolocalize(pseudolocalize: boolean): void {
    i18nManager.update({ ...i18nManager.details, pseudolocalize });
}

// brilliant magic to turn nested json keys into types
// https://newbedev.com/typescript-deep-keyof-of-a-nested-object

type Join<K, P> = K extends string | number
    ? P extends string | number
        ? `${K}${'' extends P ? '' : '.'}${P}`
        : never
    : never;

// prettier-ignore
type Prev = [
    never,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ...0[],
];

type Paths<T, D extends number = 10> = [D] extends [never]
    ? never
    : T extends object
    ? {
          [K in keyof T]-?: K extends string | number
              ? `${K}` | Join<K, Paths<T[K], Prev[D]>>
              : never;
      }[keyof T]
    : '';

/**
 * Interface for {@link I18n} that provides strong type checking for
 * translations ids.
 *
 * @typeParam T - The type of the translation json file.
 */
export type TypedI18n<T> = Omit<
    I18n,
    'translate' | 'getTranslationTree' | 'translationKeyExists'
> & {
    translate(
        id: Paths<T>,
        options: TranslateOptions,
        replacements?: PrimitiveReplacementDictionary,
    ): string;
    translate(
        id: Paths<T>,
        options: TranslateOptions,
        replacements?: ComplexReplacementDictionary,
    ): React.ReactElement;
    translate(id: Paths<T>, replacements?: PrimitiveReplacementDictionary): string;
    translate(
        id: Paths<T>,
        replacements?: ComplexReplacementDictionary,
    ): React.ReactElement;
    getTranslationTree(
        id: Paths<T>,
        replacements?: PrimitiveReplacementDictionary | ComplexReplacementDictionary,
    ): string | TranslationDictionary;
    translationKeyExists(id: Paths<T>): boolean;
};
