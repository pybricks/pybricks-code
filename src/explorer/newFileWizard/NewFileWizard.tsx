// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { Button, Classes, Dialog, FormGroup, Switch } from '@blueprintjs/core';
import React, { useCallback, useRef, useState } from 'react';
import { useId } from 'react-aria';
import { useDispatch } from 'react-redux';
import { useLocalStorage } from 'usehooks-ts';
import { HubPicker } from '../../components/hubPicker/HubPicker';
import { useHubPickerSelectedHub } from '../../components/hubPicker/hooks';
import { useFileStorageMetadata } from '../../fileStorage/hooks';
import {
    FileNameValidationResult,
    pythonFileExtension,
    validateFileName,
} from '../../pybricksMicropython/lib';
import { useSelector } from '../../reducers';
import FileNameFormGroup from '../fileNameFormGroup/FileNameFormGroup';
import { newFileWizardDidAccept, newFileWizardDidCancel } from './actions';
import { useI18n } from './i18n';

const NewFileWizard: React.VoidFunctionComponent = () => {
    const i18n = useI18n();
    const dispatch = useDispatch();

    const [useTemplate, setuseTemplate] = useLocalStorage(
        'explorer.newFileWizard.useTemplate',
        true,
    );
    const isOpen = useSelector((s) => s.explorer.newFileWizard.isOpen);
    const [fileName, setFileName] = useState('');
    const files = useFileStorageMetadata() ?? [];
    const fileNameValidation = validateFileName(
        fileName,
        pythonFileExtension,
        files.map((f) => f.path),
    );

    const [hubType] = useHubPickerSelectedHub();
    const fileNameInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = useCallback<React.FormEventHandler>(
        (e) => {
            e.preventDefault();
            dispatch(
                newFileWizardDidAccept(
                    fileName,
                    pythonFileExtension,
                    useTemplate ? hubType : undefined,
                ),
            );
        },
        [dispatch, fileName, pythonFileExtension, hubType, useTemplate],
    );

    const handleClose = useCallback(() => {
        dispatch(newFileWizardDidCancel());
    }, [dispatch]);

    const acceptButtonLabelId = useId();

    return (
        <Dialog
            icon="plus"
            title={i18n.translate('title')}
            isOpen={isOpen}
            onOpening={() => setFileName('')}
            onOpened={() => fileNameInputRef.current?.focus()}
            onClose={handleClose}
        >
            <form onSubmit={handleSubmit}>
                <div className={Classes.DIALOG_BODY}>
                    <FileNameFormGroup
                        fileName={fileName}
                        fileExtension={pythonFileExtension}
                        validationResult={fileNameValidation}
                        inputRef={fileNameInputRef}
                        onChange={setFileName}
                    />
                    <Switch
                        checked={useTemplate}
                        onChange={(e) =>
                            setuseTemplate((e.target as HTMLInputElement).checked)
                        }
                    >
                        {i18n.translate('useTemplate.label')}
                    </Switch>
                    <FormGroup
                        label={i18n.translate('template.label')}
                        disabled={!useTemplate}
                    >
                        <HubPicker disabled={!useTemplate} />
                    </FormGroup>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button
                            aria-labelledby={acceptButtonLabelId}
                            intent="primary"
                            disabled={
                                fileNameValidation !== FileNameValidationResult.IsOk
                            }
                            type="submit"
                        >
                            <span id={acceptButtonLabelId}>
                                {i18n.translate('action.create')}
                            </span>
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};

export default NewFileWizard;
