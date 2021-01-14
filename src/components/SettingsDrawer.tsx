// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Drawer, FormGroup, Switch } from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from '../actions';
import { closeSettings } from '../actions/app';
import { toggleDarkMode, toggleDocs } from '../actions/settings';
import { RootState } from '../reducers';
import { SettingsStringId } from './settings-i18n';
import en from './settings-i18n.en.json';

import './settings.scss';

type StateProps = {
    open: boolean;
    showDocs: boolean;
    darkMode: boolean;
};

type DispatchProps = {
    onClose: () => void;
    onShowDocsChanged: () => void;
    onDarkModeChanged: () => void;
};

type SettingsProps = StateProps & DispatchProps & WithI18nProps;

class SettingsDrawer extends React.PureComponent<SettingsProps> {
    render(): JSX.Element {
        const {
            i18n,
            open,
            onClose,
            showDocs,
            onShowDocsChanged,
            darkMode,
            onDarkModeChanged,
        } = this.props;
        return (
            <Drawer
                isOpen={open}
                icon="cog"
                size={Drawer.SIZE_SMALL}
                title={i18n.translate(SettingsStringId.Title)}
                onClose={() => onClose()}
            >
                <div className="pb-settings">
                    <FormGroup label={i18n.translate(SettingsStringId.AppearanceTitle)}>
                        <Switch
                            label={i18n.translate(
                                SettingsStringId.AppearanceDocumentationLabel,
                            )}
                            large={true}
                            checked={showDocs}
                            onChange={() => onShowDocsChanged()}
                        />
                        <Switch
                            label={i18n.translate(
                                SettingsStringId.AppearanceDarkModeLabel,
                            )}
                            large={true}
                            checked={darkMode}
                            onChange={() => onDarkModeChanged()}
                        />
                    </FormGroup>
                </div>
            </Drawer>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    open: state.app.showSettings,
    showDocs: state.settings.showDocs,
    darkMode: state.settings.darkMode,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onClose: (): Action => dispatch(closeSettings()),
    onShowDocsChanged: (): Action => dispatch(toggleDocs()),
    onDarkModeChanged: (): Action => dispatch(toggleDarkMode()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(
    withI18n({
        id: 'settings',
        fallback: en,
        translations: { en },
    })(SettingsDrawer),
);
