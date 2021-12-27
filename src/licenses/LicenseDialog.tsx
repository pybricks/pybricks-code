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
import { useI18n } from '@shopify/react-i18n';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { appName } from '../app/constants';
import { RootState } from '../reducers';
import { fetchList, select } from './actions';
import { LicenseStringId } from './i18n';
import en from './i18n.en.json';
import { LicenseInfo } from './reducers';

import './license.scss';

type LicenseListPanelProps = {
    onItemClick(info: LicenseInfo): void;
};

const LicenseListPanel: React.VoidFunctionComponent<LicenseListPanelProps> = (
    props,
) => {
    const licenseList = useSelector((state: RootState) => state.licenses.list);

    return (
        <div className="pb-license-list">
            {licenseList === null ? (
                // TODO: this should be translated and hooked to
                // state indicating if download is in progress
                // or there was an actual failure.
                <NonIdealState>Failed to load license data.</NonIdealState>
            ) : (
                <ButtonGroup minimal={true} vertical={true} alignText="left">
                    {licenseList.map((info, i) => (
                        <Button key={i} onClick={() => props.onItemClick(info)}>
                            {info.name}
                        </Button>
                    ))}
                </ButtonGroup>
            )}
        </div>
    );
};

const LicenseInfoPanel = React.forwardRef<HTMLDivElement>((_props, ref) => {
    const licenseInfo = useSelector((state: RootState) => state.licenses.selected);

    const [i18n] = useI18n({ id: 'license', translations: { en }, fallback: en });

    return (
        <div className="pb-license-info" ref={ref}>
            {licenseInfo == null ? (
                <NonIdealState>
                    {i18n.translate(LicenseStringId.SelectPackageHelp)}
                </NonIdealState>
            ) : (
                <div>
                    <Card>
                        <p>
                            <strong>
                                {i18n.translate(LicenseStringId.PackageLabel)}
                            </strong>{' '}
                            {licenseInfo.name}{' '}
                            <span className={Classes.TEXT_MUTED}>
                                v{licenseInfo.version}
                            </span>
                        </p>
                        {licenseInfo.author && (
                            <p>
                                <strong>
                                    {i18n.translate(LicenseStringId.AuthorLabel)}
                                </strong>{' '}
                                {licenseInfo.author}
                            </p>
                        )}
                        <p>
                            <strong>
                                {i18n.translate(LicenseStringId.LicenseLabel)}
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
    );
});

LicenseInfoPanel.displayName = 'LicenseInfoPanel';

type LicenseDialogProps = {
    isOpen: boolean;
    onClose(): void;
};

const LicenseDialog: React.VoidFunctionComponent<LicenseDialogProps> = (props) => {
    const infoDiv = React.useRef<HTMLDivElement>(null);

    const dispatch = useDispatch();

    const [i18n] = useI18n({ id: 'license', translations: { en }, fallback: en });

    return (
        <Dialog
            title={i18n.translate(LicenseStringId.Title)}
            onOpening={() => dispatch(fetchList())}
            className="pb-license-dialog"
            {...props}
        >
            <div className={Classes.DIALOG_BODY}>
                <Callout className={Classes.INTENT_PRIMARY} icon="info-sign">
                    {i18n.translate(LicenseStringId.Description, {
                        name: appName,
                    })}
                </Callout>
                <Callout className="pb-license-browser">
                    <LicenseListPanel
                        onItemClick={(info) => {
                            infoDiv.current?.scrollTo(0, 0);
                            dispatch(select(info));
                        }}
                    />
                    <LicenseInfoPanel ref={infoDiv} />
                </Callout>
            </div>
        </Dialog>
    );
};

export default LicenseDialog;
