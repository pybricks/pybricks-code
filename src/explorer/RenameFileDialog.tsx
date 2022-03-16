// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Button, Classes, Dialog } from '@blueprintjs/core';
import { useI18n } from '@shopify/react-i18n';
import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fileStorageRenameFile } from '../fileStorage/actions';
import { FileNameValidationResult } from '../pybricksMicropython/lib';
import FileNameFormGroup from './FileNameFormGroup';
import { RenameFileStringId } from './i18n';
import en from './i18n.en.json';

type RenameFileDialogProps = {
    /** The current file name (including file extension). */
    oldName: string;
    /** Controls the dialog open state. */
    isOpen: boolean;
    /** Called when the dialog is closed. */
    onClose: () => void;
};

const RenameFileDialog: React.VoidFunctionComponent<RenameFileDialogProps> = ({
    oldName,
    isOpen,
    onClose,
}) => {
    const [i18n] = useI18n({ id: 'explorer', translations: { en }, fallback: en });
    const dispatch = useDispatch();

    const [baseName, extension] = oldName.split(/(\.\w+)$/);

    const [newName, setNewName] = useState(baseName);
    const [result, setResult] = useState(FileNameValidationResult.Unknown);

    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <Dialog
            title={i18n.translate(RenameFileStringId.Title, {
                fileName: oldName,
            })}
            isOpen={isOpen}
            onOpening={() => setNewName(baseName)}
            onOpened={() => {
                inputRef.current?.select();
                inputRef.current?.focus();
            }}
            onClose={() => onClose()}
        >
            <div className={Classes.DIALOG_BODY}>
                <FileNameFormGroup
                    fileName={newName}
                    fileExtension={extension}
                    inputRef={inputRef}
                    onChange={setNewName}
                    onValidation={setResult}
                />
            </div>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <Button
                        aria-label="Rename"
                        intent="primary"
                        disabled={result !== FileNameValidationResult.IsOk}
                        onClick={() => {
                            onClose();
                            dispatch(
                                fileStorageRenameFile(
                                    oldName,
                                    `${newName}${extension}`,
                                ),
                            );
                        }}
                    >
                        {i18n.translate(RenameFileStringId.ActionRename)}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default RenameFileDialog;
