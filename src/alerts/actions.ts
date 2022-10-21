// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createAction } from '../actions';
import { AlertActions, AlertDomain, AlertProps, AlertSpecific } from '../alerts';

/**
 * Action that requests to show an alert to the user.
 *
 * @param domain The alert domain (app subsystem).
 * @param specific The specific alert for the domain.
 * @param props Any additional properties required by this specific alert.
 * @param key Optional key to use as unique identifier for toast instead `<domain>.<specific>.<props>`.
 * @param update Optional boolean flag to update existing alert instead of replacing it.
 */
export const alertsShowAlert = createAction(
    <D extends AlertDomain, S extends AlertSpecific<D>>(
        domain: D,
        specific: S,
        ...args: AlertProps<D, S> extends never
            ? [args?: never]
            : [props: AlertProps<D, S>, key?: string, update?: boolean]
    ) => ({
        type: 'alerts.action.showAlert',
        domain,
        specific,
        // HACK: using varargs to allow props and key to be optional
        props: args.at(0),
        key: args.at(1),
        update: args.at(2),
    }),
);

/**
 * Action that indicates the alert requested by {@link alertsShowAlert} was
 * dismissed.
 *
 * @param domain The alert domain (app subsystem).
 * @param specific The specific alert for the domain.
 * @param action The user-selected action that dismissed the alert.
 */
export const alertsDidShowAlert = createAction(
    <D extends AlertDomain, S extends AlertSpecific<D>>(
        domain: D,
        specific: S,
        action: AlertActions<D, S>,
    ) => ({
        type: 'alerts.action.didShowAlert',
        domain,
        specific,
        action,
    }),
);

/**
 * Action that requests to hide an alert.
 * @param key The key that matches `<domain>.<specific>.<props>` or the
 *  overridden key if used.
 */
export const alertsHideAlert = createAction((key: string) => ({
    type: 'alters.action.hideAlert',
    key,
}));
