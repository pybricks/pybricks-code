// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { AnchorButton, Classes, Dialog, Intent } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../reducers';
import ExternalLinkIcon from '../utils/ExternalLinkIcon';
import patreonLogo from './Digital-Patreon-Logo_White.png';
import gitHubIcon from './GitHub-Mark-Light-32px.png';
import { sponsorHideDialog } from './actions';
import ethIcon from './eth_logo.svg';
import { useI18n } from './i18n';
import paypalIcon from './paypal_logo.svg';

const SponsorDialog: React.VoidFunctionComponent = () => {
    const { showDialog } = useSelector((s) => s.sponsor);
    const dispatch = useDispatch();
    const i18n = useI18n();

    return (
        <Dialog
            title={i18n.translate('title', { pybricks: 'Pybricks' })}
            isOpen={showDialog}
            onClose={() => dispatch(sponsorHideDialog())}
            icon="heart"
        >
            <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
                <p>
                    <AnchorButton
                        large={true}
                        intent={Intent.PRIMARY}
                        icon={<img src={gitHubIcon} width={24} height={24} />}
                        fill={true}
                        href="https://github.com/sponsors/pybricks"
                        target="_blank"
                        rel="noreferrer"
                    >
                        GitHub Sponsors
                        <ExternalLinkIcon />
                    </AnchorButton>
                </p>
                <p>
                    <AnchorButton
                        large={true}
                        intent={Intent.PRIMARY}
                        icon={<img src={patreonLogo} width={24} height={24} />}
                        fill={true}
                        href="https://www.patreon.com/pybricks"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Patreon
                        <ExternalLinkIcon />
                    </AnchorButton>
                </p>
                <p>
                    <AnchorButton
                        large={true}
                        intent={Intent.PRIMARY}
                        icon={<img src={paypalIcon} width={24} height={24} />}
                        fill={true}
                        href="https://paypal.me/pybricks"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Paypal
                        <ExternalLinkIcon />
                    </AnchorButton>
                </p>
                <p>
                    <AnchorButton
                        large={true}
                        intent={Intent.PRIMARY}
                        icon={<img src={ethIcon} width={24} height={24} />}
                        fill={true}
                    >
                        pybricks.eth
                    </AnchorButton>
                </p>
            </div>
        </Dialog>
    );
};

export default SponsorDialog;
