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
 */
export const alertsShowAlert = createAction(
    <D extends AlertDomain, S extends AlertSpecific<D>>(
        domain: D,
        specific: S,
        ...props: AlertProps<D, S> extends never
            ? [props?: never]
            : [props: AlertProps<D, S>]
    ) => ({
        type: 'alerts.action.showAlert',
        domain,
        specific,
        // HACK: using varargs to allow props to be optional, but it is only one arg
        props: props.at(0),
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
