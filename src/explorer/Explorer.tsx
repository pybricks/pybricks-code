// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

// A file explorer control.

import {
    Button,
    ButtonGroup,
    Divider,
    IconName,
    Tree,
    TreeNodeInfo,
} from '@blueprintjs/core';
import { useI18n } from '@shopify/react-i18n';
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useDebounce } from 'usehooks-ts';
import {
    fileStorageArchiveAllFiles,
    fileStorageExportFile,
} from '../fileStorage/actions';
import { useSelector } from '../reducers';
import { preventBrowserNativeContextMenu, preventFocusOnClick } from '../utils/react';
import NewFileWizard from './NewFileWizard';
import RenameFileDialog from './RenameFileDialog';
import { explorerDeleteFile, explorerImportFiles } from './actions';
import { ExplorerStringId } from './i18n';
import en from './i18n.en.json';

type ActionButtonProps = {
    /** The icon to use for the button. */
    icon: IconName;
    /** The tooltip translation ID for the tooltip text. */
    toolTipId: ExplorerStringId;
    /** Replacements if required by `toolTipId` */
    toolTipReplacements?: { [key: string]: string };
    /** If provided, controls button disabled state. */
    disabled?: boolean;
    /** Callback for button click event. */
    onClick: () => void;
};

const ActionButton: React.VoidFunctionComponent<ActionButtonProps> = ({
    icon,
    toolTipId,
    toolTipReplacements,
    disabled,
    onClick,
}) => {
    const [i18n] = useI18n({ id: 'explorer', translations: { en }, fallback: en });

    return (
        <Button
            icon={icon}
            title={i18n.translate(toolTipId, toolTipReplacements)}
            disabled={disabled}
            onMouseDown={preventFocusOnClick}
            onClick={onClick}
        />
    );
};

type FileActionButtonGroupRef = {
    /** Sets button group internal visible state. */
    setVisible: (visible: boolean) => void;
};

type ActionButtonGroupProps = {
    /** The name of the file (displayed to user) */
    fileName: string;
};

const FileActionButtonGroup = forwardRef<
    FileActionButtonGroupRef,
    ActionButtonGroupProps
>(({ fileName }, ref) => {
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

    // HACK: Hide buttons if file is removed from storage. Without this, if a
    // file is renamed to a new name then renamed again to the original name,
    // the buttons will be showing even though the list item is not hovered
    // because the list item was removed before the mouseleave event was
    // received.
    const fileNames = useSelector((s) => s.fileStorage.fileNames);
    useEffect(() => {
        if (!fileNames.includes(fileName)) {
            setVisible(false);
        }
    }, [fileNames, fileName, setVisible]);

    useImperativeHandle(ref, () => ({ setVisible }), [setVisible]);

    return (
        <ButtonGroup minimal={true} style={visible ? {} : { display: 'none' }}>
            <ActionButton
                icon="edit"
                toolTipId={ExplorerStringId.TreeItemRenameTooltip}
                toolTipReplacements={{ fileName: fileName }}
                onClick={() => setIsRenameDialogOpen(true)}
            />
            <RenameFileDialog
                oldName={fileName}
                isOpen={isRenameDialogOpen}
                onClose={() => setIsRenameDialogOpen(false)}
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
                onClick={() => dispatch(fileStorageExportFile(fileName))}
            />
            <ActionButton
                icon="trash"
                toolTipId={ExplorerStringId.TreeItemDeleteTooltip}
                toolTipReplacements={{ fileName: fileName }}
                onClick={() => dispatch(explorerDeleteFile(fileName))}
            />
        </ButtonGroup>
    );
});

FileActionButtonGroup.displayName = 'FileActionButtonGroup';

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

const FileTree: React.VFC = () => {
    const fileNames = useSelector((s) => s.fileStorage.fileNames);
    const debouncedFileNames = useDebounce(fileNames);

    const treeContents = useMemo(
        () =>
            [...debouncedFileNames].map<
                TreeNodeInfo<{
                    actionButtonGroupRef: React.RefObject<FileActionButtonGroupRef>;
                }>
            >((item, i) => {
                const actionButtonGroupRef =
                    React.createRef<FileActionButtonGroupRef>();

                return {
                    id: i,
                    label: item,
                    secondaryLabel: (
                        <FileActionButtonGroup
                            fileName={item}
                            ref={actionButtonGroupRef}
                        />
                    ),
                    nodeData: { actionButtonGroupRef },
                };
            }),
        [debouncedFileNames],
    );

    return (
        <Tree
            contents={treeContents}
            onNodeMouseEnter={(info) =>
                info.nodeData?.actionButtonGroupRef.current?.setVisible(true)
            }
            onNodeMouseLeave={(info) =>
                info.nodeData?.actionButtonGroupRef.current?.setVisible(false)
            }
        />
    );
};

const Explorer: React.VFC = () => {
    return (
        <div className="h-100" onContextMenu={preventBrowserNativeContextMenu}>
            <Header />
            <Divider />
            <FileTree />
        </div>
    );
};

export default Explorer;
