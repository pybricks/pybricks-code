// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import './sponsorsDialog.scss';
import { AnchorButton, Classes, Dialog, Intent } from '@blueprintjs/core';
import { Heart } from '@blueprintjs/icons';

import classNames from 'classnames';
import React from 'react';
import { useDispatch } from 'react-redux';
import { alertsShowAlert } from '../alerts/actions';
import ClipboardIcon from '../components/ClipboardIcon';
import ExternalLinkIcon from '../components/ExternalLinkIcon';
import { useSelector } from '../reducers';
import patreonLogo from './Digital-Patreon-Logo_White.png';
import gitHubIcon from './GitHub-Mark-Light-32px.png';
import { sponsorHideDialog } from './actions';
import programIcon from './blocks.svg';
import ethIcon from './eth_logo.svg';
import { useI18n } from './i18n';
import paypalIcon from './paypal_logo.svg';

function getSignInLink(host: string): string {
    const state = {
        final_page: host,
    };

    const stateParameters: string = encodeURIComponent(btoa(JSON.stringify(state)));
    const scopeParameters: string =
        'identity%20identity' + encodeURIComponent('[email]');

    const signInHost = 'https://signin.pybricks.com';
    const clientId = 'UjC3q7xIkGpnXlqAySabgFgaDF38E7Zc03oKYQz_7uZ9a9SrmBa25PHuLIquEaBn';

    return `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${signInHost}&state=${stateParameters}&scope=${scopeParameters}`;
}

const SponsorDialog: React.FunctionComponent = () => {
    const { showDialog } = useSelector((s) => s.sponsor);
    const dispatch = useDispatch();
    const i18n = useI18n();
    const signinUrl = getSignInLink(window.location.origin);

    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    React.useEffect(() => {
        import('@pybricks/pybricks-blocks')
            .then((module) => setIsLoggedIn(module.isLoggedIn))
            .catch((error) => console.error(`Failed to load module: ${error}`));
    }, []);

    return (
        <Dialog
            className="pb-sponsors-dialog"
            title={i18n.translate('title', { pybricks: 'Pybricks' })}
            isOpen={showDialog}
            onClose={() => dispatch(sponsorHideDialog())}
            icon={<Heart />}
        >
            <div className={classNames(Classes.DIALOG_BODY, Classes.RUNNING_TEXT)}>
                <img src={programIcon} alt="Blocks" />

                <h4>{i18n.translate('signinCall.heading')}</h4>

                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <AnchorButton
                        large={true}
                        intent={Intent.PRIMARY}
                        icon={<img src={patreonLogo} width={24} height={24} />}
                        fill={true}
                        href={signinUrl}
                        rel="noopener"
                    >
                        {i18n.translate('signinCall.button')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                </div>
                <p></p>
                <p>
                    {i18n.translate(
                        isLoggedIn ? 'signinCall.signedIn' : 'signinCall.signedOut',
                    )}
                </p>

                <h4>{i18n.translate('signupCall.heading')}</h4>

                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <AnchorButton
                        large={true}
                        intent={Intent.PRIMARY}
                        icon={<img src={patreonLogo} width={24} height={24} />}
                        fill={true}
                        href="https://www.patreon.com/pybricks/membership"
                        target="_blank"
                        rel="noopener"
                    >
                        {i18n.translate('signupCall.button')}
                        <ExternalLinkIcon />
                    </AnchorButton>
                </div>
                <p></p>

                <p>{i18n.translate('signupCall.body')}</p>

                <ul>
                    <li>{i18n.translate('signupReason.useAllHubs')}</li>
                    <li>{i18n.translate('signupReason.useAllSensors')}</li>
                    <li>{i18n.translate('signupReason.saveOnHub')}</li>
                    <li>{i18n.translate('signupReason.accurateDriving')}</li>
                    <li>{i18n.translate('signupReason.colorSensor')}</li>
                    <li>{i18n.translate('signupReason.wireless')}</li>
                    <li>{i18n.translate('signupReason.livePreview')}</li>
                    <li>{i18n.translate('signupReason.share')}</li>
                    <li>{i18n.translate('signupReason.muchMore')}</li>
                </ul>

                <p>
                    <i>{i18n.translate('signupCall.tryFirst')}</i>
                </p>

                <h4>{i18n.translate('donateOptions.heading')}</h4>
                <p>{i18n.translate('donateOptions.options')}</p>
                <p>{i18n.translate('donateOptions.thanks')}</p>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <AnchorButton
                        large={true}
                        intent={Intent.PRIMARY}
                        icon={<img src={gitHubIcon} width={24} height={24} />}
                        fill={true}
                        href="https://github.com/sponsors/pybricks"
                        target="_blank"
                        rel="noopener"
                    >
                        GitHub Sponsors
                        <ExternalLinkIcon />
                    </AnchorButton>
                    <AnchorButton
                        large={true}
                        intent={Intent.PRIMARY}
                        icon={<img src={paypalIcon} width={24} height={24} />}
                        fill={true}
                        href="https://paypal.me/pybricks"
                        target="_blank"
                        rel="noopener"
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
