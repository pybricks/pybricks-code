// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

// The license dialog

import {
    Callout,
    Card,
    Classes,
    Dialog,
    NonIdealState,
    Spinner,
    Tree,
    TreeEventHandler,
    TreeNodeInfo,
} from '@blueprintjs/core';
import { useI18n } from '@shopify/react-i18n';
import React, { useCallback, useMemo, useState } from 'react';
import { useFetch } from 'usehooks-ts';
import { appName } from '../app/constants';
import { LicenseStringId } from './i18n';
import en from './i18n.en.json';

import './license.scss';

interface LicenseInfo {
    readonly name: string;
    readonly version: string;
    readonly author: string | undefined;
    readonly license: string;
    readonly licenseText: string;
}

type LicenseList = ReadonlyArray<LicenseInfo>;

type LicenseListPanelProps = {
    onItemClick(info?: LicenseInfo): void;
};

const LicenseListPanel: React.VoidFunctionComponent<LicenseListPanelProps> = ({
    onItemClick,
}) => {
    const [i18n] = useI18n({ id: 'license', translations: { en }, fallback: en });
    const { data, error } = useFetch<LicenseList>('static/oss-licenses.json');
    const [selectedNode, setSelectedNode] = useState<string | undefined>(undefined);

    const contents = useMemo(() => {
        if (!data) {
            return undefined;
        }

        return data.map<TreeNodeInfo<LicenseInfo>>((info, i) => ({
            id: i,
            label: info.name,
            isSelected: info.name === selectedNode,
            nodeData: info,
        }));
    }, [data, selectedNode]);

    const handleNodeClick = useCallback<TreeEventHandler<LicenseInfo>>(
        (e) => {
            setSelectedNode(e.nodeData?.name);
            onItemClick(e.nodeData);
        },
        [setSelectedNode, onItemClick],
    );

    return (
        <div className="pb-license-list">
            {contents === undefined ? (
                <NonIdealState>
                    {error ? (
                        i18n.translate(LicenseStringId.ErrorFetchFailed)
                    ) : (
                        <Spinner />
                    )}
                </NonIdealState>
            ) : (
                <Tree contents={contents} onNodeClick={handleNodeClick} />
            )}
        </div>
    );
};

type LicenseInfoPanelProps = {
    /** The license info to show or undefined if no license info is selected. */
    licenseInfo: LicenseInfo | undefined;
};

const LicenseInfoPanel = React.forwardRef<HTMLDivElement, LicenseInfoPanelProps>(
    ({ licenseInfo }, ref) => {
        const [i18n] = useI18n({ id: 'license', translations: { en }, fallback: en });

        return (
            <div className="pb-license-info" ref={ref}>
                {licenseInfo === undefined ? (
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
    },
);

LicenseInfoPanel.displayName = 'LicenseInfoPanel';

type LicenseDialogProps = {
    isOpen: boolean;
    onClose(): void;
};

const LicenseDialog: React.VoidFunctionComponent<LicenseDialogProps> = ({
    isOpen,
    onClose,
}) => {
    const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | undefined>(undefined);
    const infoDiv = React.useRef<HTMLDivElement>(null);

    const [i18n] = useI18n({ id: 'license', translations: { en }, fallback: en });

    return (
        <Dialog
            className="pb-license-dialog"
            title={i18n.translate(LicenseStringId.Title)}
            isOpen={isOpen}
            onClose={onClose}
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
                            setLicenseInfo(info);
                        }}
                    />
                    <LicenseInfoPanel licenseInfo={licenseInfo} ref={infoDiv} />
                </Callout>
            </div>
        </Dialog>
    );
};

export default LicenseDialog;
