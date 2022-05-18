// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { createContext, useState } from 'react';
import type { ToolbarProps } from './types';

export type ToolbarState = Readonly<{
    /** The DOM id of the most recently focused item. */
    lastFocusedItem?: string;
    /**
     * Sets the most recently focused item.
     * @param id  The DOM id of the element.
     */
    setLastFocusedItem: (id: string) => void;
}>;

/** React hook for managing toolbar state. */
export function useToolbarState(props: ToolbarProps): ToolbarState {
    const { firstFocusableItemId } = props;
    const [lastFocusedItem, setLastFocusedItem] = useState(firstFocusableItemId);

    return { lastFocusedItem, setLastFocusedItem };
}

/** React context for passing state from toolbar to toolbar items. */
export const ToolbarStateContext = createContext<ToolbarState>({
    lastFocusedItem: 'default',
    setLastFocusedItem: () => undefined,
});
