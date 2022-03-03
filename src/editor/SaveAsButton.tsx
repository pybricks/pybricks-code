// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import * as editorActions from '../editor/actions';
import ActionButton, { ActionButtonProps } from '../toolbar/ActionButton';
import { TooltipId } from '../toolbar/i18n';
import { EditorContext } from './Editor';
import downloadIcon from './save.svg';

type SaveAsButtonProps = Pick<ActionButtonProps, 'id'> &
    Pick<ActionButtonProps, 'keyboardShortcut'>;

const SaveAsButton: React.FunctionComponent<SaveAsButtonProps> = (props) => {
    const { editor } = useContext(EditorContext);

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
