// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// The license dialog

import {
    Button,
    ButtonGroup,
    Callout,
    Card,
    Classes,
    Dialog,
    NonIdealState,
} from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from '../actions';
import { closeLicenseDialog } from '../actions/app';
import { select } from '../actions/license';
import { RootState } from '../reducers';
import { LicenseInfo, LicenseList } from '../reducers/license';
import { appName } from '../settings/ui';
import { LicenseStringId } from './license-i18n';
import en from './license-i18n.en.json';

import './license.scss';

type StateProps = {
    showLicenseDialog: boolean;
    licenseList: LicenseList | null;
    licenseInfo: LicenseInfo | null;
};

type DispatchProps = {
    onClose: () => void;
    onSelectPackage: (info: LicenseInfo) => void;
};

type LicenseDialogProps = StateProps & DispatchProps & WithI18nProps;

class LicenseDialog extends React.Component<LicenseDialogProps> {
    render(): JSX.Element {
        const infoDiv = React.createRef<HTMLDivElement>();

        const {
            i18n,
            showLicenseDialog,
            onClose,
            licenseList,
            licenseInfo,
            onSelectPackage,
        } = this.props;
        return (
            <Dialog
                title={i18n.translate(LicenseStringId.Title)}
                isOpen={showLicenseDialog}
                onClose={() => onClose()}
                className="pb-license-dialog"
            >
                <div className={Classes.DIALOG_BODY}>
                    <Callout className={Classes.INTENT_PRIMARY} icon="info-sign">
                        {i18n.translate(LicenseStringId.Description, {
                            name: appName,
                        })}
                    </Callout>
                    <Callout className="pb-license-browser">
                        <div className="pb-license-list">
                            {licenseList === null ? (
                                // TODO: this should be translated and hooked to
                                // state indicating if download is in progress
                                // or there was an actual failure.
                                <NonIdealState>
                                    Failed to load license data.
                                </NonIdealState>
                            ) : (
                                <ButtonGroup
                                    minimal={true}
                                    vertical={true}
                                    alignText="left"
                                >
                                    {licenseList.map((info) => (
                                        <Button
                                            key={`${info.name}@${info.version}`}
                                            onClick={() => {
                                                infoDiv.current?.scrollTo(0, 0);
                                                onSelectPackage(info);
                                            }}
                                        >
                                            {info.name}
                                        </Button>
                                    ))}
                                </ButtonGroup>
                            )}
                        </div>
                        <div className="pb-license-info" ref={infoDiv}>
                            {licenseInfo == null ? (
                                <NonIdealState>
                                    {i18n.translate(LicenseStringId.SelectPackageHelp)}
                                </NonIdealState>
                            ) : (
                                <div>
                                    <Card>
                                        <p>
                                            <strong>
                                                {i18n.translate(
                                                    LicenseStringId.PackageLabel,
                                                )}
                                            </strong>{' '}
                                            {licenseInfo.name}{' '}
                                            <span className={Classes.TEXT_MUTED}>
                                                v{licenseInfo.version}
                                            </span>
                                        </p>
                                        {licenseInfo.author && (
                                            <p>
                                                <strong>
                                                    {' '}
                                                    {i18n.translate(
                                                        LicenseStringId.AuthorLabel,
                                                    )}
                                                </strong>{' '}
                                                {licenseInfo.author}
                                            </p>
                                        )}
                                        <p>
                                            <strong>
                                                {' '}
                                                {i18n.translate(
                                                    LicenseStringId.LicenseLabel,
                                                )}
                                            </strong>{' '}
                                            {licenseInfo.license}
                                        </p>
                                    </Card>
                                    <div className="pb-license-text">
                                        <pre>{licenseInfo.licenseText}</pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Callout>
                </div>
            </Dialog>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    showLicenseDialog: state.app.showLicenseDialog,
    licenseList: state.license.list,
    licenseInfo: state.license.selected,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onClose: (): Action => dispatch(closeLicenseDialog()),
    onSelectPackage: (info): Action => dispatch(select(info)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n({ id: 'license', fallback: en, translations: { en } })(LicenseDialog));
