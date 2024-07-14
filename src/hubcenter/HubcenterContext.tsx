// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2024 The Pybricks Authors
//
// Shared terminal context.

import { createContext } from 'react';
import PushStream from 'zen-push';

/** The default hubcenter context. */
export const defaultHubcenterContext = {
    dataSource: new PushStream<string>(),
};

/** Hubcenter context data type. */
export type HubcenterContextValue = typeof defaultHubcenterContext;

/** Hubcenter React context. */
export const HubcenterContext = createContext(defaultHubcenterContext);
