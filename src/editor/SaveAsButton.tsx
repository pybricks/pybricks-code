// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as editorActions from '../editor/actions';
import { RootState } from '../reducers';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import downloadIcon from './save.svg';

type SaveAsButtonProps = Pick<ActionButtonProps, 'id'> &
    Pick<ActionButtonProps, 'keyboardShortcut'>;

const SaveAsButton: React.FunctionComponent<SaveAsButtonProps> = (props) => {
    const editor = useSelector((state: RootState) => state.editor.current);

    const dispatch = useDispatch();

    return (
        <ActionButton
            tooltip={TooltipId.SaveAs}
            icon={downloadIcon}
            enabled={editor !== null}
            onAction={() => dispatch(editorActions.saveAs())}
            {...props}
        />
    );
};

export default SaveAsButton;
