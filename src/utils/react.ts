// helper functions for React components

import React, { useState } from 'react';
import { createCountFunc } from './iter';

/**
 * Callback that can be passed to onContextMenu event handlers to prevent
 * the native browser context menu from being shown.
 */
export const preventBrowserNativeContextMenu: React.MouseEventHandler = (e) =>
    e.preventDefault();

/** Style to disable pointer events. */
export const pointerEventsNone: React.CSSProperties = { pointerEvents: 'none' };

const nextId = createCountFunc();

/**
 * React hook to get a unique identifier, e.g. for linking components via
 * aria-labelledby.
 *
 * @param prefix A namespace prefix for the identifier.
 * @returns A unique identifier in the form "prefix-N"
 */
export const useUniqueId = (prefix: string): string => {
    const [uniqueId] = useState(`${prefix}-${nextId()}`);
    return uniqueId;
};
