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
import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    fileStorageArchiveAllFiles,
    fileStorageExportFile,
} from '../fileStorage/actions';
import { useSelector } from '../reducers';
import NewFileWizard from './NewFileWizard';
import { explorerDeleteFile } from './actions';
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

const ActionButton: React.VoidFunctionComponent<ActionButtonProps> = (props) => {
    const [i18n] = useI18n({ id: 'explorer', translations: { en }, fallback: en });

    return (
        <Button
            icon={props.icon}
            title={i18n.translate(props.toolTipId, props.toolTipReplacements)}
            disabled={props.disabled}
            // prevent focus on click
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => props.onClick()}
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
>((props, ref) => {
    const dispatch = useDispatch();
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({ setVisible }));

    return (
        <ButtonGroup minimal={true} style={visible ? {} : { display: 'none' }}>
            <ActionButton
                icon="edit"
                toolTipId={ExplorerStringId.TreeItemRenameTooltip}
                toolTipReplacements={{ fileName: props.fileName }}
                onClick={() => alert('not implemented')}
            />
            <ActionButton
                // NB: the "import" icon has an arrow pointing down, which is
                // what we want here since import is analogous to download
                // and it also matches the direction of the arrow on the
                // archive icon which is also used to indicate an export/
                // download operation
                icon="import"
                toolTipId={ExplorerStringId.TreeItemExportTooltip}
                toolTipReplacements={{ fileName: props.fileName }}
                onClick={() => dispatch(fileStorageExportFile(props.fileName))}
            />
            <ActionButton
                icon="trash"
                toolTipId={ExplorerStringId.TreeItemDeleteTooltip}
                toolTipReplacements={{ fileName: props.fileName }}
                onClick={() => dispatch(explorerDeleteFile(props.fileName))}
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
                    onClick={() => alert('not implemented')}
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

    const treeContents = useMemo(
        () =>
            [...fileNames].map<
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
        [fileNames],
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
        <div className="h-100" onContextMenu={(e) => e.preventDefault()}>
            <Header />
            <Divider />
            <FileTree />
        </div>
    );
};

export default Explorer;
