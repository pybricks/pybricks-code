// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors
//
// Shared terminal context.

import { createContext } from 'react';
import PushStream from 'zen-push';

/** The default terminal context. */
export const defaultTerminalContext = {
    dataSource: new PushStream<string>(),
};

/** Terminal context data type. */
export type TerminalContextValue = typeof defaultTerminalContext;

/** Terminal React context. */
export const TerminalContext = createContext(defaultTerminalContext);
