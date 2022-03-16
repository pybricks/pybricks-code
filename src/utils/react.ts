// helper functions for React components

import React from 'react';

/**
 * Callback that can be passed to onContextMenu event handlers to prevent
 * the native browser context menu from being shown.
 */
export const preventBrowserNativeContextMenu: React.MouseEventHandler = (e) =>
    e.preventDefault();

/** Style to disable pointer events. */
export const pointerEventsNone: React.CSSProperties = { pointerEvents: 'none' };
