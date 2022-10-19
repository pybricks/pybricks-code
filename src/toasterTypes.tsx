// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

import type { ToastProps, ToasterInstance } from '@blueprintjs/core';

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

/**
 * Type compatible with React.RefObject<ToasterInstance>.
 */
export type ToasterRef = { current: ToasterInstance | null };
