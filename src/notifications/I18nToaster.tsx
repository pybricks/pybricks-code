// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { IToaster, Toaster } from '@blueprintjs/core';
import { I18nContext, I18nManager } from '@shopify/react-i18n';
import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Creates an `IToaster` for static usage similar to `Toaster.create()` except
 * that it is wrapped in an `I18nContext.Provider` so that messages can be
 * translated.
 *
 * @param i18n The i18n manager object.
 */
export function create(i18n: I18nManager): IToaster {
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
