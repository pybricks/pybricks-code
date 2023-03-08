// SPDX-License-Identifier: MIT
// Copyright (c) 2023 The Pybricks Authors

import type { SerializableStateInvariantMiddlewareOptions } from '@reduxjs/toolkit';

export const serializableCheck: SerializableStateInvariantMiddlewareOptions = {
    ignoredActionPaths: [
        // copy of defaults
        'meta.arg',
        'meta.baseQueryMeta',
        // monoco view state has class-based object but is technically serializable
        'viewState.viewState.firstPosition',
        // contain ArrayBuffer, Blob or DataView
        'data',
        'file',
        'firmwareZip',
        'payload',
        'value',
        // Error is not serializable
        'error',
        'props.error',
    ],
};
