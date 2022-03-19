// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Button, Classes, Dialog } from '@blueprintjs/core';
import { useI18n } from '@shopify/react-i18n';
import React, { useCallback, useRef, useState } from 'react';
import { FileNameValidationResult } from '../pybricksMicropython/lib';
import FileNameFormGroup from './FileNameFormGroup';
import { RenameFileStringId } from './i18n';
import en from './i18n.en.json';

type RenameFileDialogProps = {
    /** The current file name (including file extension). */
    oldName: string;
    /** Controls the dialog open state. */
    isOpen: boolean;
    /** Called when the dialog is accepted. */
    onAccept: (oldName: string, newName: string) => void;
    /** Called when the dialog is canceled. */
    onCancel: () => void;
};

const RenameFileDialog: React.VoidFunctionComponent<RenameFileDialogProps> = ({
    oldName,
    isOpen,
    onAccept,
    onCancel,
}) => {
    const [i18n] = useI18n({ id: 'explorer', translations: { en }, fallback: en });

    const [baseName, extension] = oldName.split(/(\.\w+)$/);

    const [newName, setNewName] = useState(baseName);
    const [result, setResult] = useState(FileNameValidationResult.Unknown);

    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = useCallback<React.FormEventHandler>(
        (e) => {
            e.preventDefault();
            onAccept(oldName, `${newName}${extension}`);
        },
        [onAccept, oldName, newName, extension],
    );

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
            onClose={onCancel}
        >
            <form onSubmit={handleSubmit}>
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
                            intent="primary"
                            disabled={result !== FileNameValidationResult.IsOk}
                            type="submit"
                        >
                            {i18n.translate(RenameFileStringId.ActionRename)}
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};

export default RenameFileDialog;
