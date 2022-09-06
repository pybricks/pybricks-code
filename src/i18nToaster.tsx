// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import { ToastProps, Toaster, ToasterInstance } from '@blueprintjs/core';
import { I18nContext, I18nManager } from '@shopify/react-i18n';
import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Creates an `ToasterInstance` for static usage similar to `Toaster.create()` except
 * that it is wrapped in an `I18nContext.Provider` so that messages can be
 * translated.
 *
 * @param i18n The i18n manager object.
 */
export function create(i18n: I18nManager): ToasterInstance {
    const containerElement = document.createElement('div');

    document.body.appendChild(containerElement);

    const toaster = React.createRef<Toaster>();

    ReactDOM.render(
        <I18nContext.Provider value={i18n}>
            <Toaster usePortal={false} ref={toaster} />
        </I18nContext.Provider>,
        containerElement,
    );

    // istanbul ignore if: should not happen since we are rendering the component
    if (toaster.current === null) {
        throw new Error('failed to set toaster ref');
    }

    return toaster.current;
}

/**
 * Template type alert callbacks.
 *
 * This is called when an alert is dismissed.
 *
 * @param action: The action that the user selected. This is usually 'dismiss'.
 */
export type ToastActionHandler<A extends string> = (action: A) => void;

/**
 * Template type for all toast creation functions for alert components.
 *
 * @param onAction A callback that is called when the toast is dismissed.
 * @param props Additional properties required by this toast, if any (usually
 * replacements for translations).
 */
export type CreateToast<
    P extends Record<string, unknown> = never,
    A extends string = 'dismiss',
> = (onAction: ToastActionHandler<A>, props: P) => ToastProps;
