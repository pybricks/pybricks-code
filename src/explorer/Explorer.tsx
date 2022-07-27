// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

// A file explorer control.

import './explorer.scss';
import {
    Button,
    ButtonGroup,
    Divider,
    HotkeyConfig,
    IconName,
    useHotkeys,
} from '@blueprintjs/core';
import React, { useCallback, useMemo, useState } from 'react';
import { useId } from 'react-aria';
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
import { Toolbar } from '../components/toolbar/Toolbar';
import { useToolbarItemFocus } from '../components/toolbar/aria';
import { UUID } from '../fileStorage';
import { useFileStorageMetadata } from '../fileStorage/hooks';
import { isMacOS } from '../utils/os';
import { TreeItemContext, TreeItemData, renderers } from '../utils/tree-renderer';
import {
    explorerArchiveAllFiles,
    explorerCreateNewFile,
    explorerDeleteFile,
    explorerDuplicateFile,
    explorerExportFile,
    explorerImportFiles,
    explorerRenameFile,
    explorerUserActivateFile,
} from './actions';
import DeleteFileAlert from './deleteFileAlert/DeleteFileAlert';
import DuplicateFileDialog from './duplicateFileDialog/DuplicateFileDialog';
import { useI18n } from './i18n';
import NewFileWizard from './newFileWizard/NewFileWizard';
import RenameFileDialog from './renameFileDialog/RenameFileDialog';

type ActionButtonProps = {
    /** The DOM id for this instance. */
    id: string;
    /** The icon to use for the button. */
    icon: IconName;
    /** The tooltip/title text. */
    tooltip: string;
    /** Callback for button click event. */
    onClick: () => void;
};

const ActionButton: React.VoidFunctionComponent<ActionButtonProps> = ({
    id,
    icon,
    tooltip,
    onClick,
}) => {
    const handleClick = useCallback<React.MouseEventHandler>(
        (e) => {
            // prevent click on treeitem too
            e.stopPropagation();
            onClick();
        },
        [onClick],
    );

    const { toolbarItemFocusProps, excludeFromTabOrder } = useToolbarItemFocus({ id });

    return (
        <Button
            id={id}
            icon={icon}
            title={tooltip}
            onClick={handleClick}
            {...toolbarItemFocusProps}
            tabIndex={excludeFromTabOrder ? -1 : 0}
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
    const i18n = useI18n();
    const dispatch = useDispatch();
    const environment = useTreeEnvironment();

    const fileName = environment.getItemTitle(item);

    const renameButtonId = useId();
    const duplicateButtonId = useId();
    const exportButtonId = useId();
    const deleteButtonId = useId();

    return (
        <ButtonGroup
            className="pb-explorer-file-tree-action-button-group"
            minimal={true}
        >
            <Toolbar
                className="pb-explorer-file-tree-action-toolbar"
                firstFocusableItemId={duplicateButtonId}
            >
                <ActionButton
                    id={renameButtonId}
                    icon="edit"
                    tooltip={i18n.translate('treeItem.renameTooltip', { fileName })}
                    onClick={() => dispatch(explorerRenameFile(fileName))}
                />
                <ActionButton
                    id={duplicateButtonId}
                    icon="duplicate"
                    tooltip={i18n.translate('treeItem.duplicateTooltip', {
                        fileName,
                    })}
                    onClick={() => dispatch(explorerDuplicateFile(fileName))}
                />
                <ActionButton
                    id={exportButtonId}
                    // NB: the "import" icon has an arrow pointing down, which is
                    // what we want here since import is analogous to download
                    // and it also matches the direction of the arrow on the
                    // archive icon which is also used to indicate an export/
                    // download operation
                    icon="import"
                    tooltip={i18n.translate('treeItem.exportTooltip', { fileName })}
                    onClick={() => dispatch(explorerExportFile(fileName))}
                />
                <ActionButton
                    id={deleteButtonId}
                    icon="trash"
                    tooltip={i18n.translate('treeItem.deleteTooltip', { fileName })}
                    onClick={() =>
                        dispatch(explorerDeleteFile(fileName, item.index as UUID))
                    }
                />
            </Toolbar>
        </ButtonGroup>
    );
};

// matches ID in tour component
const archiveButtonId = 'pb-explorer-archive-button';
const newButtonId = 'pb-explorer-add-button';

const Header: React.VoidFunctionComponent = () => {
    const exportButtonId = useId();
    const dispatch = useDispatch();
    const i18n = useI18n();

    return (
        <Toolbar
            className="pb-explorer-header-toolbar"
            aria-label={i18n.translate('header.toolbar.title')}
            firstFocusableItemId={archiveButtonId}
        >
            <ButtonGroup minimal={true}>
                <ActionButton
                    id={archiveButtonId}
                    icon="archive"
                    tooltip={i18n.translate('header.toolbar.exportAll')}
                    onClick={() => dispatch(explorerArchiveAllFiles())}
                />
                <ActionButton
                    id={exportButtonId}
                    // NB: the "export" icon has an arrow pointing up, which is
                    // what we want here since import is analogous to upload
                    // even though this is the "import" action
                    icon="export"
                    tooltip={i18n.translate('header.toolbar.import')}
                    onClick={() => dispatch(explorerImportFiles())}
                />
                <ActionButton
                    id={newButtonId}
                    icon="plus"
                    tooltip={i18n.translate('header.toolbar.addNew')}
                    onClick={() => dispatch(explorerCreateNewFile())}
                />
            </ButtonGroup>
        </Toolbar>
    );
};

/**
 * Accessibility live descriptors.
 */
function useLiveDescriptors(): LiveDescriptors {
    const i18n = useI18n();

    return useMemo(
        () => ({
            introduction: `
                <p>${i18n.translate('tree.liveDescriptor.intro.accessibilityGuide', {
                    treeLabel: '{treeLabel}',
                })}</p>
                <p>${i18n.translate('tree.liveDescriptor.intro.navigation')}</p>
                <ul>
                    <li>${i18n.translate(
                        'tree.liveDescriptor.intro.keybindings.primaryAction',
                        { key: '{keybinding:primaryAction}' },
                    )}</li>
                    <li>${i18n.translate(
                        'tree.liveDescriptor.intro.keybindings.rename',
                        { key: 'f2' },
                    )}</li>
                    <li>${i18n.translate(
                        'tree.liveDescriptor.intro.keybindings.duplicate',
                        { key: `${isMacOS() ? 'cmd' : 'ctrl'}+d` },
                    )}</li>
                    <li>${i18n.translate(
                        'tree.liveDescriptor.intro.keybindings.export',
                        { key: `${isMacOS() ? 'cmd' : 'ctrl'}+e` },
                    )}</li>
                    <li>${i18n.translate(
                        'tree.liveDescriptor.intro.keybindings.delete',
                        { key: 'delete' },
                    )}</li>
                </ul>
            `,
            renamingItem: 'not used',
            searching: `<p>${i18n.translate('tree.liveDescriptor.searching')}</p>`,
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

    const handleDuplicateKeyDown = useCallback(() => {
        if (focusedItem !== undefined) {
            const fileName = environment.getItemTitle(environment.items[focusedItem]);
            dispatch(explorerDuplicateFile(fileName));
        }
    }, [environment]);

    const handleDeleteKeyDown = useCallback(() => {
        if (focusedItem !== undefined) {
            const fileName = environment.getItemTitle(environment.items[focusedItem]);
            dispatch(explorerDeleteFile(fileName, focusedItem as UUID));
        }
    }, [environment]);

    const handleExportKeyDown = useCallback(() => {
        if (focusedItem !== undefined) {
            const fileName = environment.getItemTitle(environment.items[focusedItem]);
            dispatch(explorerExportFile(fileName));
        }
    }, [environment]);

    const hotkeys = useMemo<readonly HotkeyConfig[]>(
        () => [
            {
                combo: 'f2',
                label: 'Rename',
                disabled: !hotKeyActive,
                preventDefault: true,
                stopPropagation: true,
                onKeyDown: handleRenameKeyDown,
            },
            {
                combo: 'mod+d',
                label: 'Duplicate',
                disabled: !hotKeyActive,
                preventDefault: true,
                stopPropagation: true,
                onKeyDown: handleDuplicateKeyDown,
            },
            {
                combo: 'del',
                label: 'Delete',
                disabled: !hotKeyActive,
                preventDefault: true,
                stopPropagation: true,
                onKeyDown: handleDeleteKeyDown,
            },
            {
                combo: 'mod+e',
                label: 'Export',
                disabled: !hotKeyActive,
                preventDefault: true,
                stopPropagation: true,
                onKeyDown: handleExportKeyDown,
            },
        ],
        [hotKeyActive, handleDeleteKeyDown],
    );

    const { handleKeyDown } = useHotkeys(hotkeys);

    return <div onKeyDown={handleKeyDown}>{renderers.renderTreeContainer(props)}</div>;
};

const FileTree: React.VoidFunctionComponent = () => {
    const [focusedItem, setFocusedItem] = useState<TreeItemIndex>();
    const files = useFileStorageMetadata() ?? [];
    const liveDescriptors = useLiveDescriptors();

    const rootItemIndex = 'root';

    const treeItems = useMemo(
        () =>
            files.reduce(
                (obj, file) => {
                    const index = file.uuid;

                    obj[index] = {
                        index,
                        data: {
                            fileName: file.path,
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
                        children: [...files].map((f) => f.uuid),
                    },
                } as Record<TreeItemIndex, FileTreeItem>,
            ),
        [files],
    );

    const getItemTitle = useCallback((item: FileTreeItem) => item.data.fileName, []);

    const treeId = 'pb-explorer-file-tree';

    const viewState = useMemo(
        () => ({ [treeId]: { focusedItem } }),
        [treeId, focusedItem],
    );

    const dispatch = useDispatch();
    const i18n = useI18n();

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
            onPrimaryAction={(item) =>
                dispatch(
                    explorerUserActivateFile(item.data.fileName, item.index as UUID),
                )
            }
        >
            <div className="pb-explorer-file-tree">
                <Tree
                    treeId={treeId}
                    rootItem={rootItemIndex}
                    treeLabel={i18n.translate('tree.label')}
                />
            </div>
        </ControlledTreeEnvironment>
    );
};

const Explorer: React.VFC = () => {
    return (
        <div className="pb-explorer">
            <Header />
            <Divider />
            <FileTree />
            <NewFileWizard />
            <RenameFileDialog />
            <DuplicateFileDialog />
            <DeleteFileAlert />
        </div>
    );
};

export default Explorer;
