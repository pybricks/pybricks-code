// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Drawer, FormGroup, Switch } from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from '../actions';
import { closeSettings } from '../actions/app';
import { toggleDarkMode } from '../actions/settings';
import { RootState } from '../reducers';
import { SettingsStringId } from './settings-i18n';
import en from './settings-i18n.en.json';

import './settings.scss';

type StateProps = {
    open: boolean;
    darkMode: boolean;
};

type DispatchProps = {
    onClose: () => void;
    onDarkModeChanged: () => void;
};

type SettingsProps = StateProps & DispatchProps & WithI18nProps;

class SettingsDrawer extends React.PureComponent<SettingsProps> {
    render(): JSX.Element {
        const { i18n, open, onClose, darkMode, onDarkModeChanged } = this.props;
        return (
            <Drawer
                isOpen={open}
                icon="cog"
                title={i18n.translate(SettingsStringId.Title)}
                onClose={() => onClose()}
            >
                <div className="pb-settings">
                    <FormGroup label={i18n.translate(SettingsStringId.AppearanceTitle)}>
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
    darkMode: state.settings.darkMode,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onClose: (): Action => dispatch(closeSettings()),
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
