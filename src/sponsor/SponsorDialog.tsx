// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { AnchorButton, Classes, Dialog, Intent } from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';
import { useDispatch } from 'react-redux';
import { alertsShowAlert } from '../alerts/actions';
import { pybricksTeamUrl } from '../app/constants';
import { useSelector } from '../reducers';
import ClipboardIcon from '../utils/ClipboardIcon';
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
                <h4>{i18n.translate('whoAreWe.heading')}</h4>
                <p>
                    {i18n.translate('whoAreWe.team.about', {
                        team: (
                            <>
                                <a
                                    href={pybricksTeamUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {i18n.translate('whoAreWe.team.team')}
                                </a>
                                <ExternalLinkIcon />
                            </>
                        ),
                    })}
                </p>
                <p>{i18n.translate('whoAreWe.mission')}</p>

                <h4>{i18n.translate('whyDonate.heading')}</h4>
                <p>{i18n.translate('whyDonate.body')}</p>
                <p>
                    <ul>
                        <li>{i18n.translate('donateReason.keepPybricksFree')}</li>
                        <li>{i18n.translate('donateReason.supportNewHubs')}</li>
                        <li>{i18n.translate('donateReason.writeDocs')}</li>
                        <li>{i18n.translate('donateReason.exploreFeatures')}</li>
                        <li>{i18n.translate('donateReason.supportOthers')}</li>
                    </ul>
                </p>

                <h4>{i18n.translate('donateOptions.heading')}</h4>
                <p>{i18n.translate('donateOptions.options')}</p>
                <p>{i18n.translate('donateOptions.thanks')}</p>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
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
                    <AnchorButton
                        large={true}
                        intent={Intent.PRIMARY}
                        icon={<img src={ethIcon} width={24} height={24} />}
                        fill={true}
                        onClick={() => {
                            navigator.clipboard.writeText('pybricks.eth');
                            dispatch(alertsShowAlert('sponsor', 'addressCopied'));
                        }}
                    >
                        pybricks.eth
                        <ClipboardIcon />
                    </AnchorButton>
                </div>
            </div>
        </Dialog>
    );
};

export default SponsorDialog;
