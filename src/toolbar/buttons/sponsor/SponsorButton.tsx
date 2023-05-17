// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import React from 'react';
import { useDispatch } from 'react-redux';
import { sponsorShowDialog } from '../../../sponsor/actions';
import ActionButton, { ActionButtonProps } from '../../ActionButton';
import { useI18n } from './i18n';
import icon from './icon.svg';

type SponsorButtonProps = Pick<ActionButtonProps, 'id'>;

const SponsorButton: React.FunctionComponent<SponsorButtonProps> = ({ id }) => {
    const i18n = useI18n();
    const dispatch = useDispatch();

    return (
        <ActionButton
            id={id}
            label={i18n.translate('label')}
            tooltip={i18n.translate('tooltip.action')}
            icon={icon}
            onAction={() => dispatch(sponsorShowDialog())}
        />
    );
};

export default SponsorButton;
