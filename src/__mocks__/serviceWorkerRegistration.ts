// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

// mock implementation of serviceWorkerRegistration for testing

type Config = {
    onSuccess?: (r: ServiceWorkerRegistration) => void;
    onUpdate?: (r: ServiceWorkerRegistration) => void;
};

/** The config that was registered, if any. */
let globalConfig: Config | undefined;

/**
 * Mocks the register() function.
 *
 * This just saves the config for later use.
 *
 * @param config The config.
 */
export function register(config?: Config): void {
    globalConfig = config;
}

/**
 * Fires the onSuccess callback that was registered, if any.
 *
 * @param registration The registration to pass to the callback.
 */
export function _fireOnSuccess(registration: ServiceWorkerRegistration): void {
    if (globalConfig && globalConfig.onSuccess) {
        globalConfig.onSuccess(registration);
    }
}

/**
 * Fires the onUpdate callback that was registered, if any.
 *
 * @param registration The registration to pass to the callback.
 */
export function _fireOnUpdate(registration: ServiceWorkerRegistration): void {
    if (globalConfig && globalConfig.onUpdate) {
        globalConfig.onUpdate(registration);
    }
}

/**
 * Mocks the unregister() function.
 */
export function unregister(): void {
    // nothing to do for now
}
