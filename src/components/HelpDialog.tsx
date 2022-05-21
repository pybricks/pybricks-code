// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import './HelpDialog.scss';
import { Classes } from '@blueprintjs/core';
import { Classes as Classes2 } from '@blueprintjs/popover2';
import {
    POPOVER_ARROW_SVG_SIZE,
    Popover2Arrow,
} from '@blueprintjs/popover2/lib/cjs/popover2Arrow';
import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { I18nId, useI18n } from './i18n';

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
const HelpDialog: React.FunctionComponent<HelpDialogProps> = ({
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

    // HACK: workaround https://github.com/palantir/blueprint/pull/5302
    useEffect(() => {
        arrow?.setAttribute('aria-hidden', 'true');
    }, [arrow]);

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
                        Classes2.POPOVER2_TRANSITION_CONTAINER,
                        Classes.OVERLAY_CONTENT,
                    )}
                    ref={setPopperElement}
                    style={styles.popper}
                    {...attributes.popper}
                >
                    <div
                        className={classNames(
                            Classes2.POPOVER2,
                            `${Classes2.POPOVER2}-${isOpen ? 'open' : 'close'}`,
                            `${Classes2.POPOVER2_CONTENT_PLACEMENT}-right`,
                            Classes2.POPOVER2_CONTENT_SIZING,
                        )}
                        onAnimationEnd={onAnimationEnd}
                    >
                        <Popover2Arrow
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
                                <div id={descId} className={Classes2.POPOVER2_CONTENT}>
                                    {children}
                                </div>
                                <DismissButton
                                    id={dismissId}
                                    aria-label={i18n.translate(
                                        I18nId.HelpDialogCloseButtonLabel,
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
