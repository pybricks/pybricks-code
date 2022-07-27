// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import React from 'react';
import { useDispatch } from 'react-redux';
import { appName } from '../../../app/constants';
import { tourStart } from '../../../tour/actions';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import { useI18n } from './i18n';
import icon from './icon.svg';

type TourButtonProps = Pick<ActionButtonProps, 'id'>;

const TourButton: React.VoidFunctionComponent<TourButtonProps> = ({ id }) => {
    const i18n = useI18n();
    const dispatch = useDispatch();

    return (
        <ActionButton
            id={id}
            label={i18n.translate('label', { appName })}
            tooltip={i18n.translate('tooltip', { appName })}
            icon={icon}
            onAction={() => dispatch(tourStart())}
        />
    );
};

export default TourButton;
