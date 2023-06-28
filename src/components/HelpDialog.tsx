// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './HelpDialog.scss';
import { Classes } from '@blueprintjs/core';
import {
    POPOVER_ARROW_SVG_SIZE,
    PopoverArrow,
} from '@blueprintjs/core/lib/cjs/components/popover/popoverArrow';
import classNames from 'classnames';
import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import {
    DismissButton,
    FocusScope,
    mergeProps,
    useDialog,
    useId,
    useModal,
    useOverlay,
} from 'react-aria';
import { usePopper } from 'react-popper';
import { useI18n } from './i18n';

type HelpDialogProps = {
    /** The title of the dialog. */
    title: string;
    /** Controls the dialog open state. */
    isOpen: boolean;
    /** The button that triggered the dialog to open. */
    openButton: HTMLButtonElement | null;
    /** Called when the dialog has been requested to close. */
    onClose: () => void;
    /** Called if/when CSS animation ends on the `.pb-help-dialog` element. */
    onAnimationEnd?: () => void;
};

/** React component for showing help as a dialog. */
const HelpDialog: React.FunctionComponent<PropsWithChildren<HelpDialogProps>> = ({
    title,
    isOpen,
    openButton,
    onClose,
    onAnimationEnd,
    children,
}) => {
    const i18n = useI18n();

    // this is the dialog element and the popper element
    const ref = useRef<HTMLDivElement>(null);

    const { overlayProps, underlayProps } = useOverlay(
        { isOpen, onClose, isDismissable: true },
        ref,
    );
    const descId = useId();
    const { modalProps } = useModal();
    const { dialogProps } = useDialog(
        { 'aria-label': title, 'aria-describedby': descId },
        ref,
    );
    const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);

    const [arrow, setArrow] = useState<HTMLDivElement | null>(null);

    const { styles, attributes, state } = usePopper(
        openButton,
        popperElement,
        useMemo(
            () => ({
                placement: 'right',
                modifiers: [
                    {
                        name: 'arrow',
                        options: {
                            element: arrow,
                        },
                    },
                    {
                        name: 'offset',
                        options: {
                            offset: [0, POPOVER_ARROW_SVG_SIZE / 2],
                        },
                    },
                ],
            }),
            [arrow],
        ),
    );

    // HACK: since there are not keyboard focusable elements for autoFocus
    // we have to manually focus the only focusable element in the dialog,
    // otherwise the FocusScope doesn't work.

    const dismissId = useId();

    useEffect(() => {
        document.getElementById(dismissId)?.focus();
    }, [dismissId]);

    return (
        <div
            className={classNames(Classes.OVERLAY, { [Classes.OVERLAY_OPEN]: isOpen })}
        >
            <div className={Classes.OVERLAY_BACKDROP} {...underlayProps}>
                <div
                    className={classNames(
                        Classes.POPOVER_TRANSITION_CONTAINER,
                        Classes.OVERLAY_CONTENT,
                    )}
                    ref={setPopperElement}
                    style={styles.popper}
                    {...attributes.popper}
                >
                    <div
                        className={classNames(
                            Classes.POPOVER,
                            `${Classes.POPOVER}-${isOpen ? 'open' : 'close'}`,
                            `${Classes.POPOVER_CONTENT_PLACEMENT}-right`,
                            Classes.POPOVER_CONTENT_SIZING,
                        )}
                        onAnimationEnd={onAnimationEnd}
                    >
                        <PopoverArrow
                            arrowProps={{ ref: setArrow, style: styles.arrow }}
                            placement={state?.placement ?? 'auto'}
                        />
                        <FocusScope contain restoreFocus autoFocus>
                            <div
                                aria-modal
                                className="pb-help-dialog"
                                ref={ref}
                                {...mergeProps(overlayProps, dialogProps, modalProps)}
                                // dialog itself should not be focusable
                                tabIndex={undefined}
                                // clicking anywhere in the dialog closes it
                                onClick={onClose}
                            >
                                <div id={descId} className={Classes.POPOVER_CONTENT}>
                                    {children}
                                </div>
                                <DismissButton
                                    id={dismissId}
                                    aria-label={i18n.translate(
                                        'helpDialog.closeButton.label',
                                    )}
                                    onDismiss={onClose}
                                />
                            </div>
                        </FocusScope>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpDialog;
