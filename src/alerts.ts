// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { ToastProps } from '@blueprintjs/core';
import alerts from './alerts/alerts';
import ble from './ble/alerts';
import explorer from './explorer/alerts';
import firmware from './firmware/alerts';
import { CreateToast } from './i18nToaster';

/** This collects alerts from all of the subsystems of the app */
const alertDomains = {
    alerts,
    ble,
    explorer,
    firmware,
};

/** Gets the type of available alert domains. */
export type AlertDomain = keyof typeof alertDomains;

/**
 * Gets the type of available specific alerts for a domain.
 * @template D The domain.
 */
export type AlertSpecific<D extends AlertDomain> = keyof typeof alertDomains[D];

/**
 * Gets the instance type of the object in the lookup table.
 * @template D The domain.
 * @template S The specific instance name in the domain.
 */
type AlertInstance<
    D extends AlertDomain,
    S extends AlertSpecific<D>,
> = typeof alertDomains[D][S] extends CreateToast<infer P, infer A>
    ? CreateToast<P, A>
    : never;

/**
 * Gets the type of the `onAlert` callback for a specific instance in the lookup table.
 * @template D The domain.
 * @template S The specific instance name in the domain.
 */
export type AlertCallback<
    D extends AlertDomain,
    S extends AlertSpecific<D>,
> = Parameters<AlertInstance<D, S>>[0];

/**
 * Gets the type of available actions for a specific instance in the lookup table.
 * @template D The domain.
 * @template S The specific instance name in the domain.
 */
export type AlertActions<D extends AlertDomain, S extends AlertSpecific<D>> =
    | Parameters<Parameters<AlertInstance<D, S>>[0]>[0];

/**
 * Gets the type of the properties for a specific instance in the lookup table.
 * @template D The domain.
 * @template S The specific instance name in the domain.
 */
export type AlertProps<D extends AlertDomain, S extends AlertSpecific<D>> = Parameters<
    AlertInstance<D, S>
>[1];

/**
 * Gets the alert creation function from the lookup table and uses it to create
 * a new alert (toast).
 *
 * @param domain The alert domain (app subsystem).
 * @param specific The specific alert for the domain.
 * @param onAlert The callback that will be called when the alert is dismissed.
 * @param props Any additional properties required by this specific alert.
 * @returns The newly created alert properties.
 */
export function getAlertProps<D extends AlertDomain, S extends AlertSpecific<D>>(
    domain: D,
    specific: S,
    onAlert: AlertCallback<D, S>,
    props: AlertProps<D, S>,
): ToastProps {
    const create = alertDomains[domain][specific] as unknown as CreateToast<
        Record<string, unknown> | never,
        string
    >;
    return create(onAlert, props);
}
