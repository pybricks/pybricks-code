// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// The about dialog

import { AnchorButton, Button, Classes, Dialog } from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { connect } from 'react-redux';
import { closeAboutDialog, openLicenseDialog } from '../app/actions';
import {
    appName,
    legoDisclaimer,
    pybricksCopyright,
    pybricksWebsiteUrl,
} from '../app/constants';
import LicenseDialog from '../licenses/LicenseDialog';
import { RootState } from '../reducers';
import ExternalLinkIcon from '../utils/ExternalLinkIcon';
import { AboutStringId } from './i18n';
import en from './i18n.en.json';

import './about.scss';

const version = process.env.REACT_APP_VERSION;

type StateProps = { showAboutDialog: boolean };

type DispatchProps = { onClose: () => void; onLicenseButtonClick: () => void };

type AboutDialogProps = StateProps & DispatchProps & WithI18nProps;

class AboutDialog extends React.Component<AboutDialogProps> {
    render(): JSX.Element {
        const { i18n, showAboutDialog, onClose, onLicenseButtonClick } = this.props;
        return (
            <Dialog
                title={`${appName} v${version}`}
                isOpen={showAboutDialog}
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
                        <Button onClick={() => onLicenseButtonClick()}>
                            {i18n.translate(AboutStringId.LicenseButtonLabel)}
                        </Button>
                        <AnchorButton href={pybricksWebsiteUrl} target="blank_">
                            {i18n.translate(AboutStringId.WebsiteButtonLabel)}&nbsp;
                            <ExternalLinkIcon />
                        </AnchorButton>
                    </div>
                </div>
                <LicenseDialog />
            </Dialog>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    showAboutDialog: state.app.showAboutDialog,
});

const mapDispatchToProps: DispatchProps = {
    onClose: closeAboutDialog,
    onLicenseButtonClick: openLicenseDialog,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n({ id: 'about', fallback: en, translations: { en } })(AboutDialog));
