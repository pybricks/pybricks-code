// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Alert, Classes, Intent } from '@blueprintjs/core';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../reducers';
import { deleteFileAlertDidAccept, deleteFileAlertDidCancel } from './actions';
import { I18nId, useI18n } from './i18n';

const DeleteFileAlert: React.VoidFunctionComponent = () => {
    const { isOpen, fileName } = useSelector((s) => s.explorer.deleteFileAlert);
    const dispatch = useDispatch();
    const i18n = useI18n();

    // a11y: focus primary button when dialog is opened
    const handleOpened = useCallback((node: HTMLElement) => {
        // HACK: get the accept button
        // there doesn't seem to be a nice way to access it via props/ref/etc
        const button = node.querySelector<HTMLButtonElement>(
            `button.${Classes.INTENT_DANGER}`,
        );

        // istanbul ignore if: bug if reached
        if (!button) {
            console.error('bug: could not find accept button');
            return;
        }

        button.focus();
    }, []);

    return (
        <Alert
            canEscapeKeyCancel={true}
            canOutsideClickCancel={true}
            isOpen={isOpen}
            icon="trash"
            intent={Intent.DANGER}
            confirmButtonText={i18n.translate(I18nId.Accept)}
            cancelButtonText={i18n.translate(I18nId.Cancel)}
            onConfirm={() => dispatch(deleteFileAlertDidAccept())}
            onCancel={() => dispatch(deleteFileAlertDidCancel())}
            onOpened={handleOpened}
        >
            {i18n.translate(I18nId.Message, { fileName })}
        </Alert>
    );
};

export default DeleteFileAlert;
