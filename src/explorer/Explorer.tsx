// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

// A file explorer control.

import {
    Button,
    ButtonGroup,
    Divider,
    HotkeyConfig,
    IconName,
    useHotkeys,
} from '@blueprintjs/core';
import { useI18n } from '@shopify/react-i18n';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ControlledTreeEnvironment,
    LiveDescriptors,
    Tree,
    TreeItem,
    TreeItemIndex,
    useTree,
    useTreeEnvironment,
} from 'react-complex-tree';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'usehooks-ts';
import {
    fileStorageArchiveAllFiles,
    fileStorageExportFile,
} from '../fileStorage/actions';
import { useSelector } from '../reducers';
import { isMacOS } from '../utils/os';
import { preventBrowserNativeContextMenu } from '../utils/react';
import { TreeItemContext, TreeItemData, renderers } from '../utils/tree-renderer';
import NewFileWizard from './NewFileWizard';
import { explorerDeleteFile, explorerImportFiles, explorerRenameFile } from './actions';
import { ExplorerStringId } from './i18n';
import en from './i18n.en.json';
import RenameFileDialog from './renameFileDialog/RenameFileDialog';
import './explorer.scss';

type ActionButtonProps = {
    /** The icon to use for the button. */
    icon: IconName;
    /** The tooltip translation ID for the tooltip text. */
    toolTipId: ExplorerStringId;
    /** Replacements if required by `toolTipId` */
    toolTipReplacements?: { [key: string]: string };
    /** If provided, controls button disabled state. */
    disabled?: boolean;
    /** If false, prevent focus. Default is true. */
    focusable?: boolean;
    /** Callback for button click event. */
    onClick: () => void;
};

const ActionButton: React.VoidFunctionComponent<ActionButtonProps> = ({
    icon,
    toolTipId,
    toolTipReplacements,
    disabled,
    focusable,
    onClick,
}) => {
    const [i18n] = useI18n({ id: 'explorer', translations: { en }, fallback: en });

    return (
        <Button
            icon={icon}
            title={i18n.translate(toolTipId, toolTipReplacements)}
            disabled={disabled}
            tabIndex={focusable === false ? -1 : undefined}
            onFocus={focusable === false ? (e) => e.preventDefault() : undefined}
            onClick={onClick}
        />
    );
};

type FileTreeItemData = TreeItemData & { fileName: string };

type FileTreeItem = TreeItem<FileTreeItemData>;

type ActionButtonGroupProps = {
    /** The name of the file (displayed to user) */
    item: TreeItem;
};

const FileActionButtonGroup: React.VoidFunctionComponent<ActionButtonGroupProps> = ({
    item,
}) => {
    const dispatch = useDispatch();
    const environment = useTreeEnvironment();

    const fileName = environment.getItemTitle(item);

    return (
        <ButtonGroup
            aria-hidden={true}
            className="pb-explorer-file-action-button-group"
            minimal={true}
        >
            <ActionButton
                icon="edit"
                toolTipId={ExplorerStringId.TreeItemRenameTooltip}
                toolTipReplacements={{ fileName }}
                focusable={false}
                onClick={() => dispatch(explorerRenameFile(fileName))}
            />
            <ActionButton
                // NB: the "import" icon has an arrow pointing down, which is
                // what we want here since import is analogous to download
                // and it also matches the direction of the arrow on the
                // archive icon which is also used to indicate an export/
                // download operation
                icon="import"
                toolTipId={ExplorerStringId.TreeItemExportTooltip}
                toolTipReplacements={{ fileName: fileName }}
                focusable={false}
                onClick={() => dispatch(fileStorageExportFile(fileName))}
            />
            <ActionButton
                icon="trash"
                toolTipId={ExplorerStringId.TreeItemDeleteTooltip}
                toolTipReplacements={{ fileName: fileName }}
                focusable={false}
                onClick={() => dispatch(explorerDeleteFile(fileName))}
            />
        </ButtonGroup>
    );
};

const Header: React.VFC = () => {
    const [isNewFileWizardOpen, setIsNewFileWizardOpen] = useState(false);
    const dispatch = useDispatch();
    const fileNames = useSelector((s) => s.fileStorage.fileNames);

    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ButtonGroup minimal={true}>
                <ActionButton
                    icon="archive"
                    toolTipId={ExplorerStringId.HeaderExportAllTooltip}
                    disabled={fileNames.length === 0}
                    onClick={() => dispatch(fileStorageArchiveAllFiles())}
                />
                <ActionButton
                    // NB: the "export" icon has an arrow pointing up, which is
                    // what we want here since import is analogous to upload
                    // even though this is the "import" action
                    icon="export"
                    toolTipId={ExplorerStringId.HeaderImportTooltip}
                    onClick={() => dispatch(explorerImportFiles())}
                />
                <ActionButton
                    icon="plus"
                    toolTipId={ExplorerStringId.HeaderAddNewTooltip}
                    onClick={() => setIsNewFileWizardOpen(true)}
                />
                <NewFileWizard
                    isOpen={isNewFileWizardOpen}
                    onClose={() => setIsNewFileWizardOpen(false)}
                />
            </ButtonGroup>
        </div>
    );
};

/**
 * Accessibility live descriptors.
 */
function useLiveDescriptors(): LiveDescriptors {
    const [i18n] = useI18n({ id: 'explorer', translations: { en }, fallback: en });

    return useMemo(
        () => ({
            introduction: `
                <p>${i18n.translate(
                    ExplorerStringId.TreeLiveDescriptorIntroAccessibilityGuide,
                    { treeLabel: '{treeLabel}' },
                )}</p>
                <p>${i18n.translate(
                    ExplorerStringId.TreeLiveDescriptorIntroNavigation,
                )}</p>
                <ul>
                    <li>${i18n.translate(
                        ExplorerStringId.TreeLiveDescriptorIntroKeybindingsPrimaryAction,
                        { key: '{keybinding:primaryAction}' },
                    )}</li>
                    <li>${i18n.translate(
                        ExplorerStringId.TreeLiveDescriptorIntroKeybindingsRename,
                        { key: 'f2' },
                    )}</li>
                    <li>${i18n.translate(
                        ExplorerStringId.TreeLiveDescriptorIntroKeybindingsExport,
                        { key: `${isMacOS() ? 'cmd' : 'ctrl'}+e` },
                    )}</li>
                    <li>${i18n.translate(
                        ExplorerStringId.TreeLiveDescriptorIntroKeybindingsDelete,
                        { key: 'delete' },
                    )}</li>
                </ul>
            `,
            renamingItem: 'not used',
            searching: `<p>${i18n.translate(
                ExplorerStringId.TreeLiveDescriptorSearching,
            )}</p>`,
            programmaticallyDragging: 'not used',
            programmaticallyDraggingTarget: 'not used',
        }),
        [i18n],
    );
}

/**
 * Adds additional key bindings to {@link renderers.renderTreeContainer}.
 *
 * REVISIT: maybe there will be a better way to do this some day:
 * https://github.com/lukasbach/react-complex-tree/issues/47
 */
const renderTreeContainer: typeof renderers.renderTreeContainer = (props) => {
    const dispatch = useDispatch();
    const { treeId } = useTree();
    const environment = useTreeEnvironment();
    const focusedItem = environment.viewState[treeId]?.focusedItem;

    const isActiveTree = environment.activeTreeId === treeId;
    const hotKeyActive =
        isActiveTree; /* && !dnd.isProgrammaticallyDragging && !isRenaming */

    const handleRenameKeyDown = useCallback(() => {
        if (focusedItem !== undefined) {
            const fileName = environment.getItemTitle(environment.items[focusedItem]);
            dispatch(explorerRenameFile(fileName));
        }
    }, [environment]);

    const handleDeleteKeyDown = useCallback(() => {
        if (focusedItem !== undefined) {
            const fileName = environment.getItemTitle(environment.items[focusedItem]);
            dispatch(explorerDeleteFile(fileName));
        }
    }, [environment]);

    const handleExportKeyDown = useCallback(() => {
        if (focusedItem !== undefined) {
            const fileName = environment.getItemTitle(environment.items[focusedItem]);
            dispatch(fileStorageExportFile(fileName));
        }
    }, [environment]);

    const hotkeys = useMemo<readonly HotkeyConfig[]>(
        () => [
            {
                combo: 'f2',
                label: 'Rename',
                disabled: !hotKeyActive,
                preventDefault: true,
                onKeyDown: handleRenameKeyDown,
            },
            {
                combo: 'del',
                label: 'Delete',
                disabled: !hotKeyActive,
                preventDefault: true,
                onKeyDown: handleDeleteKeyDown,
            },
            {
                combo: 'mod+e',
                label: 'Export',
                disabled: !hotKeyActive,
                preventDefault: true,
                onKeyDown: handleExportKeyDown,
            },
        ],
        [hotKeyActive, handleDeleteKeyDown],
    );

    const { handleKeyDown } = useHotkeys(hotkeys);

    return <div onKeyDown={handleKeyDown}>{renderers.renderTreeContainer(props)}</div>;
};

const FileTree: React.VFC = () => {
    const [i18n] = useI18n({ id: 'explorer', translations: { en }, fallback: en });
    const [focusedItem, setFocusedItem] = useState<TreeItemIndex>();
    const fileNames = useSelector((s) => s.fileStorage.fileNames);
    const debouncedFileNames = useDebounce(fileNames);
    const liveDescriptors = useLiveDescriptors();

    const rootItemIndex = '/';

    const treeItems = useMemo(
        () =>
            debouncedFileNames.reduce(
                (obj, fileName) => {
                    const index = `/${fileName}`;

                    obj[index] = {
                        index,
                        data: {
                            fileName,
                            icon: 'document',
                            secondaryLabel: (
                                <TreeItemContext.Consumer>
                                    {(item) => <FileActionButtonGroup item={item} />}
                                </TreeItemContext.Consumer>
                            ),
                        },
                    };

                    return obj;
                },
                {
                    [rootItemIndex]: {
                        index: rootItemIndex,
                        data: { fileName: '/' },
                        hasChildren: true,
                        children: debouncedFileNames.map((n) => `/${n}`),
                    },
                } as Record<TreeItemIndex, FileTreeItem>,
            ),
        [debouncedFileNames],
    );

    const getItemTitle = useCallback((item: FileTreeItem) => item.data.fileName, []);

    const treeId = 'pb-explorer-file-tree';

    const viewState = useMemo(
        () => ({ [treeId]: { focusedItem } }),
        [treeId, focusedItem],
    );

    return (
        <ControlledTreeEnvironment<FileTreeItemData>
            {...renderers}
            renderTreeContainer={renderTreeContainer}
            items={treeItems}
            getItemTitle={getItemTitle}
            viewState={viewState}
            liveDescriptors={liveDescriptors}
            canRename={false} // we implement our own rename handler
            onFocusItem={(item) => setFocusedItem(item.index)}
        >
            <div className="pb-explorer-file-tree">
                <Tree
                    treeId={treeId}
                    rootItem={rootItemIndex}
                    treeLabel={i18n.translate(ExplorerStringId.TreeLabel)}
                />
            </div>
        </ControlledTreeEnvironment>
    );
};

const Explorer: React.VFC = () => {
    return (
        <div className="h-100" onContextMenu={preventBrowserNativeContextMenu}>
            <Header />
            <Divider />
            <FileTree />
            <RenameFileDialog />
        </div>
    );
};

export default Explorer;
