// helper functions for React components

import React from 'react';

/**
 * Callback that can be passed to onMouseDown event handlers to prevent
 * an element from becoming focused when clicked.
 */
export const preventFocusOnClick: React.MouseEventHandler = (e) => e.preventDefault();

/**
 * Callback that can be passed to onContextMenu event handlers to prevent
 * the native browser context menu from being shown.
 */
export const preventBrowserNativeContextMenu: React.MouseEventHandler = (e) =>
    e.preventDefault();
