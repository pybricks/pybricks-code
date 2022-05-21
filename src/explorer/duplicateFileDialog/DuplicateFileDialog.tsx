// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Button, Classes, Dialog } from '@blueprintjs/core';
import React, { useCallback, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useFileStorageMetadata } from '../../fileStorage/hooks';
import {
    FileNameValidationResult,
    validateFileName,
} from '../../pybricksMicropython/lib';
import { useSelector } from '../../reducers';
import FileNameFormGroup from '../fileNameFormGroup/FileNameFormGroup';
import { duplicateFileDialogDidAccept, duplicateFileDialogDidCancel } from './actions';
import { I18nId, useI18n } from './i18n';

const DuplicateFileDialog: React.VFC = () => {
    const i18n = useI18n();
    const dispatch = useDispatch();
    const isOpen = useSelector((s) => s.explorer.duplicateFileDialog.isOpen);
    const oldName = useSelector((s) => s.explorer.duplicateFileDialog.fileName);

    const [baseName, extension] = oldName.split(/(\.\w+)$/);

    const [newName, setNewName] = useState(baseName);
    const files = useFileStorageMetadata() ?? [];
    const result = validateFileName(
        newName,
        extension,
        files.map((f) => f.path),
    );

    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = useCallback<React.FormEventHandler>(
        (e) => {
            e.preventDefault();
            dispatch(duplicateFileDialogDidAccept(oldName, `${newName}${extension}`));
        },
        [dispatch, oldName, newName, extension],
    );

    const handleClose = useCallback(() => {
        dispatch(duplicateFileDialogDidCancel());
    }, [dispatch]);

    return (
        <Dialog
            title={i18n.translate(I18nId.Title, {
                fileName: oldName,
            })}
            isOpen={isOpen}
            onOpening={() => setNewName(baseName)}
            onOpened={() => {
                inputRef.current?.select();
                inputRef.current?.focus();
            }}
            onClose={handleClose}
        >
            <form onSubmit={handleSubmit}>
                <div className={Classes.DIALOG_BODY}>
                    <FileNameFormGroup
                        fileName={newName}
                        fileExtension={extension}
                        validationResult={result}
                        inputRef={inputRef}
                        onChange={setNewName}
                    />
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button
                            intent="primary"
                            disabled={result !== FileNameValidationResult.IsOk}
                            type="submit"
                        >
                            {i18n.translate(I18nId.ActionAccept)}
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};

export default DuplicateFileDialog;
