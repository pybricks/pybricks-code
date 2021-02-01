// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// The about dialog

import { AnchorButton, Button, Classes, Dialog } from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { connect } from 'react-redux';
import {
    appName,
    legoDisclaimer,
    pybricksCopyright,
    pybricksWebsiteUrl,
} from '../app/constants';
import LicenseDialog from '../licenses/LicenseDialog';
import ExternalLinkIcon from '../utils/ExternalLinkIcon';
import { AboutStringId } from './i18n';
import en from './i18n.en.json';

import './about.scss';

const version = process.env.REACT_APP_VERSION;

type OwnProps = { isOpen: boolean; onClose: () => void };

type AboutDialogProps = OwnProps & WithI18nProps;

class AboutDialog extends React.Component<AboutDialogProps> {
    public state = {
        licenseDialogIsOpen: false,
    };

    render(): JSX.Element {
        const { isOpen, onClose, i18n } = this.props;
        return (
            <Dialog
                title={`${appName} v${version}`}
                isOpen={isOpen}
                onClose={() => onClose()}
            >
                <div className={Classes.DIALOG_BODY}>
                    <div className="pb-about-icon">
                        <img src="favicon.ico" />
                    </div>
                    <p>
                        <strong>{i18n.translate(AboutStringId.Description)}</strong>
                    </p>
                    <p>{pybricksCopyright}</p>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <p>
                        <small>{legoDisclaimer}</small>
                    </p>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button
                            onClick={() => this.setState({ licenseDialogIsOpen: true })}
                        >
                            {i18n.translate(AboutStringId.LicenseButtonLabel)}
                        </Button>
                        <AnchorButton href={pybricksWebsiteUrl} target="blank_">
                            {i18n.translate(AboutStringId.WebsiteButtonLabel)}&nbsp;
                            <ExternalLinkIcon />
                        </AnchorButton>
                    </div>
                </div>
                <LicenseDialog
                    isOpen={this.state.licenseDialogIsOpen}
                    onClose={() => this.setState({ licenseDialogIsOpen: false })}
                />
            </Dialog>
        );
    }
}

export default connect()(
    withI18n({ id: 'about', fallback: en, translations: { en } })(AboutDialog),
);
