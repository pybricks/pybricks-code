// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { Drawer } from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { connect } from 'react-redux';
import { Action, Dispatch } from '../actions';
import { closeSettings } from '../actions/app';
import { RootState } from '../reducers';
import { SettingsStringId } from './settings-i18n';
import en from './settings-i18n.en.json';

type StateProps = {
    open: boolean;
};

type DispatchProps = {
    onClose: () => void;
};

type SettingsProps = StateProps & DispatchProps & WithI18nProps;

class SettingsDrawer extends React.PureComponent<SettingsProps> {
    render(): JSX.Element {
        const { i18n, open, onClose } = this.props;
        return (
            <Drawer
                isOpen={open}
                icon="cog"
                title={i18n.translate(SettingsStringId.Title)}
                onClose={() => onClose()}
            ></Drawer>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    open: state.app.showSettings,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onClose: (): Action => dispatch(closeSettings()),
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
