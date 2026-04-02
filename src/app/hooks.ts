// SPDX-License-Identifier: MIT
// Copyright (c) 2026 The Pybricks Authors

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PanelSize, usePanelRef } from 'react-resizable-panels';

/**
 * Hook to manage a collapsible panel's size as a percentage (0–100).
 *
 * This bridges React's declarative state with the library's imperative
 * collapse/expand/resize API:
 * - `size` tracks the panel's percentage when visible.
 * - `visible` controls whether the panel is collapsed or expanded.
 * - Setting `visible` to true restores the previous `size`.
 * - Setting `size` also updates `visible` accordingly.
 * - The `onResize` callback syncs both states when the user drags.
 *
 * The panel should set `collapsible`, `collapsedSize="0%"`, and a `minSize`
 * so that dragging below the minimum auto-collapses.
 */
export function useCollapsiblePanel(initiallyVisble: boolean, initialSize: number) {
    const panelRef = usePanelRef();
    const [size, _setSize] = useState(initialSize);
    const [visible, _setVisible] = useState(initiallyVisble);

    const setSize = useCallback((s: number) => {
        _setSize(s);
        _setVisible(s > 0);
    }, []);

    const setVisible = useCallback((v: boolean) => _setVisible(v), []);

    useEffect(() => {
        const panel = panelRef.current;
        if (!panel) {
            return;
        }
        if (!visible) {
            if (!panel.isCollapsed()) {
                panel.collapse();
            }
        } else {
            if (panel.isCollapsed()) {
                panel.expand();
            }
            if (panel.getSize().asPercentage !== size) {
                panel.resize(size + '%');
            }
        }
    }, [size, visible, panelRef]);

    const onResize = useCallback(
        (panelSize: PanelSize) => {
            const collapsed = panelRef.current?.isCollapsed() ?? false;
            if (collapsed) {
                // Only update state if the user dragged to collapse
                // (visible is still true). If we collapsed programmatically,
                // visible is already false and size should be preserved.
                if (visible) {
                    _setVisible(false);
                    // Reset to initial size so reopening looks normal
                    // rather than tiny.
                    _setSize(initialSize);
                }
            } else {
                _setVisible(true);
                _setSize(panelSize.asPercentage);
            }
        },
        [panelRef, initialSize, visible],
    );

    return useMemo(
        () => ({ panelRef, size, setSize, visible, setVisible, onResize }),
        [panelRef, size, setSize, visible, setVisible, onResize],
    );
}
