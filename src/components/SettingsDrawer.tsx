// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Drawer, FormGroup, Switch } from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from '../actions';
import { closeSettings } from '../actions/app';
import { setBoolean } from '../actions/settings';
import { RootState } from '../reducers';
import { SettingId } from '../settings';
import { isMacOS } from '../utils/os';
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
    onShowDocsChanged: (checked: boolean) => void;
    onDarkModeChanged: (checked: boolean) => void;
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
                    <FormGroup
                        label={i18n.translate(SettingsStringId.AppearanceTitle)}
                        helperText={i18n.translate(
                            SettingsStringId.AppearanceZoomHelp,
                            {
                                in: <span>{isMacOS() ? 'Cmd' : 'Ctrl'}-+</span>,
                                out: <span>{isMacOS() ? 'Cmd' : 'Ctrl'}--</span>,
                            },
                        )}
                    >
                        <Switch
                            label={i18n.translate(
                                SettingsStringId.AppearanceDocumentationLabel,
                            )}
                            large={true}
                            checked={showDocs}
                            onChange={(e) =>
                                onShowDocsChanged(
                                    (e.target as HTMLInputElement).checked,
                                )
                            }
                        />
                        <Switch
                            label={i18n.translate(
                                SettingsStringId.AppearanceDarkModeLabel,
                            )}
                            large={true}
                            checked={darkMode}
                            onChange={(e) =>
                                onDarkModeChanged(
                                    (e.target as HTMLInputElement).checked,
                                )
                            }
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
    onShowDocsChanged: (checked): Action =>
        dispatch(setBoolean(SettingId.ShowDocs, checked)),
    onDarkModeChanged: (checked): Action =>
        dispatch(setBoolean(SettingId.DarkMode, checked)),
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
