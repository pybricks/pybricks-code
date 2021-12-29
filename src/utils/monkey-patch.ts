// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Tooltip2 } from '@blueprintjs/popover2';
import React, { useEffect, useRef } from 'react';

/** Hack to access private members of Popover2. */
interface Popover2Private {
    handleTargetBlur: (e: React.FocusEvent<HTMLElement>) => void;
    handleMouseLeave: (e: React.MouseEvent<HTMLElement>) => void;
}
/** Hack to access private members of Tooltip2. */
interface Tooltip2Private {
    popover: Popover2Private;
}

/**
 * Monkey patch Popover2 blur event handler to make tooltips close when
 * focus is lost.
 *
 * https://github.com/palantir/blueprint/issues/4503
 *
 * @returns A React ref to be attached to the Tooltip2 component.
 */
export function useTooltip2MonkeyPatch<T>(): React.RefObject<Tooltip2<T>> {
    const tooltipRef = useRef<Tooltip2<T>>(null);

    useEffect(() => {
        if (!tooltipRef.current) {
            return;
        }

        const tooltip = tooltipRef.current as unknown as Tooltip2Private;

        const oldHandleTargetBlur = tooltip.popover.handleTargetBlur;

        tooltip.popover.handleTargetBlur = (e) => {
            if (e.relatedTarget) {
                oldHandleTargetBlur(e);
            } else {
                closeTooltip2(tooltipRef);
            }
        };

        return () => {
            tooltip.popover.handleTargetBlur = oldHandleTargetBlur;
        };
    }, [tooltipRef]);

    return tooltipRef;
}

/**
 * Hack to access private members of Tooltip2 to programmatically close the tooltip.
 * @param tooltipRef The reference returned from useTooltip2MonkeyPatch()
 */
export function closeTooltip2<T>(tooltipRef: React.RefObject<Tooltip2<T>>): void {
    if (!tooltipRef.current) {
        return;
    }

    const tooltip = tooltipRef.current as unknown as Tooltip2Private;

    // Currently, the event arg is not used so it should be safe to pass undefined.
    tooltip.popover.handleMouseLeave(
        undefined as unknown as React.MouseEvent<HTMLElement>,
    );
}
