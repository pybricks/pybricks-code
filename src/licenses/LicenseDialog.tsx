// SPDX-License-Identifier: MIT
// Copyright (c) 2021-2022 The Pybricks Authors

// The license dialog

import './license.scss';
import {
    Callout,
    Card,
    Classes,
    Dialog,
    NonIdealState,
    Spinner,
    Text,
} from '@blueprintjs/core';
import { Item } from '@react-stately/collections';
import { ListProps, ListState, useListState } from '@react-stately/list';
import type { Node, Selection } from '@react-types/shared';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import { mergeProps, useFocusRing, useListBox, useOption } from 'react-aria';
import { useFetch } from 'usehooks-ts';
import { appName } from '../app/constants';
import { useI18n } from './i18n';

interface LicenseInfo {
    readonly name: string;
    readonly version: string;
    readonly author: string | undefined;
    readonly license: string;
    readonly licenseText: string;
}

type LicenseList = ReadonlyArray<LicenseInfo>;

type ListItemProps = {
    item: Node<LicenseInfo>;
    state: ListState<LicenseInfo>;
};

/**
 * A list item component using react-aria.
 *
 * Style uses blueprints tree styles since there is no list style.
 */
const ListItem: React.VoidFunctionComponent<ListItemProps> = ({ item, state }) => {
    const ref = React.useRef<HTMLLIElement>(null);
    const { optionProps, isSelected } = useOption({ key: item.key }, state, ref);

    const { isFocusVisible, focusProps } = useFocusRing();

    return (
        <li
            className={classNames(
                Classes.TREE_NODE,
                isSelected && Classes.TREE_NODE_SELECTED,
                'pb-focus-managed',
                isFocusVisible && 'pb-focus-ring',
            )}
            {...mergeProps(optionProps, focusProps)}
            ref={ref}
        >
            <div className={Classes.TREE_NODE_CONTENT}>
                <Text className={Classes.TREE_NODE_LABEL} ellipsize>
                    {item.rendered}
                </Text>
            </div>
        </li>
    );
};

/**
 * Memoized version of list items.
 *
 * This saves us from having to rerender all items in the list each time one
 * item changes.
 */
const MemoizedListItem = React.memo(ListItem, (prev, next) => {
    // selection and focus are the only thing that can change currently

    if (
        prev.state.selectionManager.focusedKey === prev.item.key ||
        next.state.selectionManager.focusedKey === next.item.key
    ) {
        return false;
    }

    if (
        prev.state.selectionManager.selectedKeys.has(prev.item.key) ||
        next.state.selectionManager.selectedKeys.has(next.item.key)
    ) {
        return false;
    }

    return true;
});

MemoizedListItem.displayName = 'MemoizedListItem';

type ListBoxProps = ListProps<LicenseInfo>;

/**
 * A list component using react-aria.
 *
 * Style uses blueprints tree styles since there is no list style.
 */
const ListBox: React.VoidFunctionComponent<ListBoxProps> = (props) => {
    // Create state based on the incoming props
    const state = useListState(props);

    // Get props for the listbox element
    const ref = React.useRef<HTMLUListElement>(null);
    const { listBoxProps } = useListBox(props, state, ref);

    return (
        <div className={Classes.TREE}>
            <ul
                className={classNames(Classes.TREE_NODE_LIST, Classes.TREE_ROOT)}
                {...listBoxProps}
                ref={ref}
            >
                {[...state.collection].map((item) => (
                    <MemoizedListItem key={item.key} item={item} state={state} />
                ))}
            </ul>
        </div>
    );
};

type LicenseListPanelProps = {
    /** Called when item is selected. */
    onItemSelected(info?: LicenseInfo): void;
};

const LicenseListPanel: React.VoidFunctionComponent<LicenseListPanelProps> = ({
    onItemSelected,
}) => {
    const i18n = useI18n();
    const { data, error } = useFetch<LicenseList>('static/oss-licenses.json');

    const handleSelectionChanged = useCallback(
        (keys: Selection) => {
            if (!data) {
                return;
            }

            // istanbul ignore if: not reachable since list uses single selection
            if (keys === 'all') {
                return;
            }

            onItemSelected(data.find((item) => keys.has(item.name)));
        },
        [data, onItemSelected],
    );

    return (
        <div className="pb-license-list">
            {data === undefined ? (
                <NonIdealState>
                    {error ? i18n.translate('error.fetchFailed') : <Spinner />}
                </NonIdealState>
            ) : (
                <ListBox
                    aria-label={i18n.translate('packageList.label')}
                    selectionMode="single"
                    onSelectionChange={handleSelectionChanged}
                    items={data}
                >
                    {(item) => <Item key={item.name}>{item.name}</Item>}
                </ListBox>
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
        const i18n = useI18n();

        return (
            <div className="pb-license-info" ref={ref}>
                {licenseInfo === undefined ? (
                    <NonIdealState>
                        {i18n.translate('help.selectPackage')}
                    </NonIdealState>
                ) : (
                    <div>
                        <Card>
                            <p>
                                <strong>{i18n.translate('packageLabel')}</strong>{' '}
                                {licenseInfo.name}{' '}
                                <span className={Classes.TEXT_MUTED}>
                                    v{licenseInfo.version}
                                </span>
                            </p>
                            {licenseInfo.author && (
                                <p>
                                    <strong>{i18n.translate('authorLabel')}</strong>{' '}
                                    {licenseInfo.author}
                                </p>
                            )}
                            <p>
                                <strong>{i18n.translate('licenseLabel')}</strong>{' '}
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
    const i18n = useI18n();

    return (
        <Dialog
            className="pb-license-dialog"
            title={i18n.translate('title')}
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className={Classes.DIALOG_BODY}>
                <Callout className={Classes.INTENT_PRIMARY} icon="info-sign">
                    {i18n.translate('description', {
                        name: appName,
                    })}
                </Callout>
                <Callout className="pb-license-browser">
                    <LicenseListPanel
                        onItemSelected={(info) => {
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
