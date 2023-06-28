// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import {
    Button,
    Classes,
    ControlGroup,
    Dialog,
    FormGroup,
    Switch,
    Text,
} from '@blueprintjs/core';
import { Plus } from '@blueprintjs/icons';
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

const NewFileWizard: React.FunctionComponent = () => {
    const i18n = useI18n();
    const dispatch = useDispatch();

    const [useTemplate, setUseTemplate] = useLocalStorage(
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
        [dispatch, fileName, hubType, useTemplate],
    );

    const handleClose = useCallback(() => {
        dispatch(newFileWizardDidCancel());
    }, [dispatch]);

    const acceptButtonLabelId = useId();

    return (
        <Dialog
            icon={<Plus />}
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
                    <FormGroup label={i18n.translate('template.label')}>
                        <ControlGroup vertical>
                            <Switch
                                checked={useTemplate}
                                onChange={(e) =>
                                    setUseTemplate(
                                        (e.target as HTMLInputElement).checked,
                                    )
                                }
                            >
                                {i18n.translate('useTemplate.label')}
                            </Switch>
                            <Text className={Classes.TEXT_MUTED}>
                                {useTemplate
                                    ? i18n.translate('useTemplate.description.checked')
                                    : i18n.translate(
                                          'useTemplate.description.unchecked',
                                      )}
                            </Text>
                        </ControlGroup>
                        <div className="pb-spacer" />
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
