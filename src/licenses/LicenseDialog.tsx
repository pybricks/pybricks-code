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
} from '@blueprintjs/core';
import { I18n, useI18n } from '@shopify/react-i18n';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ControlledTreeEnvironment,
    Tree,
    TreeItem,
    TreeItemIndex,
    TreeViewState,
} from 'react-complex-tree';
import { useFetch } from 'usehooks-ts';
import { appName } from '../app/constants';
import { TreeItemData, renderers } from '../utils/tree-renderer';
import { I18nId } from './i18n';

import './license.scss';

interface LicenseInfo extends TreeItemData {
    readonly name: string;
    readonly version: string;
    readonly author: string | undefined;
    readonly license: string;
    readonly licenseText: string;
}

type LicenseList = ReadonlyArray<LicenseInfo>;

type LicenseListPanelProps = {
    /** Called when item is clicked. */
    onItemClick(info?: LicenseInfo): void;
    /** Translation context. */
    i18n: I18n;
};

const LicenseListPanel: React.VoidFunctionComponent<LicenseListPanelProps> = ({
    onItemClick,
    i18n,
}) => {
    const { data, error } = useFetch<LicenseList>('static/oss-licenses.json');
    const [focusedItem, setFocusedItem] = useState<TreeItemIndex>();
    const [activeItem, setActiveItem] = useState<TreeItemIndex>();

    const contents = useMemo(() => {
        if (!data) {
            return undefined;
        }

        return data.reduce(
            (obj, info, i) => {
                obj[i] = {
                    index: i,
                    data: info,
                };

                return obj;
            },
            {
                root: {
                    index: 'root',
                    data: {} as LicenseInfo,
                    hasChildren: true,
                    children: data.map((_info, i) => i),
                },
            } as Record<TreeItemIndex, TreeItem<LicenseInfo>>,
        );
    }, [data]);

    const handlePrimaryAction = useCallback(
        (item: TreeItem<LicenseInfo>) => {
            setActiveItem(item.index);
            onItemClick(item.data);
        },
        [onItemClick],
    );

    const viewState = useMemo<TreeViewState>(
        () => ({
            'pb-license-list': {
                focusedItem,
                // REVISIT: it would be nice if there was an active item separate
                // from using selected items.
                selectedItems: activeItem === undefined ? undefined : [activeItem],
            },
        }),
        [focusedItem, activeItem],
    );

    return (
        <div className="pb-license-list">
            {contents === undefined ? (
                <NonIdealState>
                    {error ? i18n.translate(I18nId.ErrorFetchFailed) : <Spinner />}
                </NonIdealState>
            ) : (
                <ControlledTreeEnvironment<LicenseInfo>
                    {...renderers}
                    items={contents}
                    getItemTitle={(item) => item.data.name}
                    viewState={viewState}
                    canRename={false}
                    showLiveDescription={false}
                    onFocusItem={(item) => setFocusedItem(item.index)}
                    onPrimaryAction={handlePrimaryAction}
                >
                    <Tree treeId="pb-license-list" rootItem="root" />
                </ControlledTreeEnvironment>
            )}
        </div>
    );
};

type LicenseInfoPanelProps = {
    /** The license info to show or undefined if no license info is selected. */
    licenseInfo: LicenseInfo | undefined;
    /** Translation context. */
    i18n: I18n;
};

const LicenseInfoPanel = React.forwardRef<HTMLDivElement, LicenseInfoPanelProps>(
    ({ licenseInfo, i18n }, ref) => {
        return (
            <div className="pb-license-info" ref={ref}>
                {licenseInfo === undefined ? (
                    <NonIdealState>
                        {i18n.translate(I18nId.SelectPackageHelp)}
                    </NonIdealState>
                ) : (
                    <div>
                        <Card>
                            <p>
                                <strong>{i18n.translate(I18nId.PackageLabel)}</strong>{' '}
                                {licenseInfo.name}{' '}
                                <span className={Classes.TEXT_MUTED}>
                                    v{licenseInfo.version}
                                </span>
                            </p>
                            {licenseInfo.author && (
                                <p>
                                    <strong>
                                        {i18n.translate(I18nId.AuthorLabel)}
                                    </strong>{' '}
                                    {licenseInfo.author}
                                </p>
                            )}
                            <p>
                                <strong>{i18n.translate(I18nId.LicenseLabel)}</strong>{' '}
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

    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();

    return (
        <Dialog
            className="pb-license-dialog"
            title={i18n.translate(I18nId.Title)}
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className={Classes.DIALOG_BODY}>
                <Callout className={Classes.INTENT_PRIMARY} icon="info-sign">
                    {i18n.translate(I18nId.Description, {
                        name: appName,
                    })}
                </Callout>
                <Callout className="pb-license-browser">
                    <LicenseListPanel
                        onItemClick={(info) => {
                            infoDiv.current?.scrollTo(0, 0);
                            setLicenseInfo(info);
                        }}
                        i18n={i18n}
                    />
                    <LicenseInfoPanel
                        licenseInfo={licenseInfo}
                        ref={infoDiv}
                        i18n={i18n}
                    />
                </Callout>
            </div>
        </Dialog>
    );
};

export default LicenseDialog;
