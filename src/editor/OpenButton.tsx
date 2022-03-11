// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import * as notificationActions from '../notifications/actions';
import { pythonFileExtension } from '../pybricksMicropython/lib';
import OpenFileButton, { OpenFileButtonProps } from '../toolbar/OpenFileButton';
import { TooltipId } from '../toolbar/i18n';
import { EditorContext } from './Editor';
import * as editorActions from './actions';
import openIcon from './open.svg';

type OpenButtonProps = Pick<OpenFileButtonProps, 'id'>;

const OpenButton: React.FunctionComponent<OpenButtonProps> = (props) => {
    const { editor } = useContext(EditorContext);
    const dispatch = useDispatch();

    return (
        <OpenFileButton
            fileExtension={pythonFileExtension}
            tooltip={TooltipId.Open}
            icon={openIcon}
            enabled={editor !== null}
            onFile={(data) => dispatch(editorActions.open(data))}
            onReject={(file) =>
                dispatch(
                    notificationActions.add(
                        'error',
                        `'${file.name}' is not a valid python file.`,
                    ),
                )
            }
            {...props}
        />
    );
};

export default OpenButton;
