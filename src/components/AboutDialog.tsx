// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// The about dialog

import { AnchorButton, Classes, Dialog } from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from '../actions';
import { closeAboutDialog } from '../actions/app';
import { RootState } from '../reducers';
import {
    appName,
    legoDisclaimer,
    pybricksCopyright,
    pybricksWebsiteUrl,
} from '../settings/ui';
import { AboutStringId } from './about-i18n';
import en from './about-i18n.en.json';

type StateProps = { showAboutDialog: boolean };

type DispatchProps = { onClose: () => void };

type AboutDialogProps = StateProps & DispatchProps & WithI18nProps;

class AboutDialog extends React.Component<AboutDialogProps> {
    render(): JSX.Element {
        const { i18n, showAboutDialog, onClose } = this.props;
        return (
            <Dialog title={appName} isOpen={showAboutDialog} onClose={() => onClose()}>
                <div className={Classes.DIALOG_BODY}>
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
                        <AnchorButton href={pybricksWebsiteUrl} target="blank_">
                            {i18n.translate(AboutStringId.WebsiteButtonLabel)}
                        </AnchorButton>
                    </div>
                </div>
            </Dialog>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    showAboutDialog: state.app.showAboutDialog,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onClose: (): Action => dispatch(closeAboutDialog()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n({ id: 'about', fallback: en, translations: { en } })(AboutDialog));
