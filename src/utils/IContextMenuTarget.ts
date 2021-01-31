// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors
//
// Alternative to @blueprintjs/core ContextMenuTarget decorator.

import { ContextMenu } from '@blueprintjs/core';

export interface IContextMenuTarget {
    renderContextMenu(): JSX.Element;
    onContextMenuClose(): void;
}

export function handleContextMenu(
    event: React.MouseEvent,
    target: IContextMenuTarget,
): void {
    // istanbul ignore if: not expected
    if (event.defaultPrevented) {
        return;
    }

    event.preventDefault();

    const listener = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            // istanbul ignore if: not expected
            if (e.defaultPrevented) {
                return;
            }

            e.preventDefault();
            ContextMenu.hide();
        }
    };
    window.addEventListener('keydown', listener);

    ContextMenu.show(
        target.renderContextMenu(),
        { left: event.clientX, top: event.clientY },
        () => {
            window.removeEventListener('keydown', listener);
            target.onContextMenuClose();
        },
    );
}
