// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './replaceImportDialog.scss';
import { Button, Checkbox, Classes, Dialog, Intent } from '@blueprintjs/core';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../reducers';
import {
    ReplaceImportDialogAction,
    replaceImportDialogDidAccept,
    replaceImportDialogDidCancel,
} from './actions';
import { useI18n } from './i18n';

const RenameImportDialog: React.FunctionComponent = () => {
    const i18n = useI18n();
    const dispatch = useDispatch();
    const isOpen = useSelector((s) => s.explorer.replaceImportDialog.isOpen);
    const fileName = useSelector((s) => s.explorer.replaceImportDialog.fileName);
    const [remember, setRemember] = useState(false);

    const handleSubmit = useCallback<React.FormEventHandler>(
        (e) => {
            e.preventDefault();
            dispatch(
                replaceImportDialogDidAccept(
                    ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement)
                        .value as ReplaceImportDialogAction,
                    remember,
                ),
            );
        },
        [dispatch, remember],
    );

    const handleClose = useCallback(() => {
        dispatch(replaceImportDialogDidCancel());
    }, [dispatch]);

    return (
        <Dialog
            className="pb-explorer-replaceImportDialog"
            title={i18n.translate('title')}
            isOpen={isOpen}
            onOpening={() => setRemember(false)}
            onClose={handleClose}
        >
            <form onSubmit={handleSubmit} method="dialog">
                <div className={Classes.DIALOG_BODY}>
                    <p>{i18n.translate('message', { fileName })}</p>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <Checkbox
                        checked={remember}
                        onChange={(e) =>
                            setRemember((e.target as HTMLInputElement).checked)
                        }
                    >
                        {i18n.translate('option.remember')}
                    </Checkbox>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button
                            intent="none"
                            type="submit"
                            value={ReplaceImportDialogAction.Skip}
                        >
                            {i18n.translate('action.skip')}
                        </Button>
                        <Button
                            intent={Intent.DANGER}
                            type="submit"
                            value={ReplaceImportDialogAction.Replace}
                        >
                            {i18n.translate('action.replace')}
                        </Button>
                        <Button
                            intent={Intent.PRIMARY}
                            type="submit"
                            value={ReplaceImportDialogAction.Rename}
                        >
                            {i18n.translate('action.rename')}
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};

export default RenameImportDialog;
