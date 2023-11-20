// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import './editor.scss';

import { ResizeSensor } from '@blueprintjs/core';
import {
    injectPybricksBlocks,
    isLoggedIn,
    setLightTheme,
} from '@pybricks/pybricks-blocks';
import * as Blockly from 'blockly';
import * as monaco from 'monaco-editor';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useEffectOnce, useTernaryDarkMode } from 'usehooks-ts';
import { docsPathPrefix } from '../app/constants';
import { useAppLastDocsPageSetting } from '../app/hooks';
import { useSettingIsShowDocsEnabled } from '../settings/hooks';
import { sponsorShowDialog } from '../sponsor/actions';
import { editorCloseFile } from './actions';
import { BLOCK_MARKER, BlocksNewProject } from './blockUtils';
import { getDocsUrl } from './docLinks';

interface BlocksEditorProps {
    editor: monaco.editor.IStandaloneCodeEditor | undefined;
    initialProject: BlocksNewProject | null;
    togglePreview: () => void;
}

interface IMyStandaloneCodeEditor extends monaco.editor.IStandaloneCodeEditor {
    setHiddenAreas(range: monaco.IRange[]): void;
    _modelData?: {
        viewModel?: {
            previousHiddenAreas?: monaco.IRange[];
        };
    };
}

const editorHideFirstLine = (
    defaultEditor: monaco.editor.IStandaloneCodeEditor | undefined | null,
) => {
    const editor = defaultEditor as IMyStandaloneCodeEditor;
    if (!editor) {
        throw new Error('editor not set');
    }

    const rangeNone = [new monaco.Range(0, 0, 0, 0)];
    const rangeHideFirst = [new monaco.Range(1, 0, 1, 0)];

    // setHiddenAreas caches value despite resetting on setValue, so
    // clear internal value before setting it again.
    if (editor?._modelData?.viewModel?.previousHiddenAreas) {
        editor._modelData.viewModel.previousHiddenAreas = rangeNone;
    }
    editor.setHiddenAreas(rangeHideFirst);
};

const BlocksEditor: React.FC<BlocksEditorProps> = ({
    editor,
    initialProject,
    togglePreview,
}) => {
    const [blockEditor, setBlockEditor] = useState<Blockly.WorkspaceSvg>();
    const blockEditorRef = useRef<HTMLDivElement>(null);

    const { isDarkMode } = useTernaryDarkMode();
    useEffect(() => {
        if (blockEditor) {
            setLightTheme(blockEditor.id, !isDarkMode);
        }
    }, [blockEditor, isDarkMode]);

    const { toggleIsSettingShowDocsEnabled, setIsSettingShowDocsEnabled } =
        useSettingIsShowDocsEnabled();
    const { setLastDocsPage } = useAppLastDocsPageSetting();

    const dispatch = useDispatch();

    useEffectOnce(() => {
        if (!blockEditorRef.current || !initialProject) {
            return;
        }

        if (!isLoggedIn) {
            dispatch(sponsorShowDialog());
            dispatch(editorCloseFile(initialProject.UUID));
        }

        // Hide first line even if block project isn't loaded yet. This
        // ensures people can see their code normally even when signed out.
        editorHideFirstLine(editor);

        const projectCallbacks = {
            handleWorkspaceUpdate: (
                id: string,
                project: string,
                code: string,
                _valid: boolean,
            ) => {
                // window.localStorage?.setItem('minimalWorkspace', project);
                if (!code) {
                    return;
                }
                if (!editor) {
                    throw new Error('editor not set');
                }

                editor.setValue(`${BLOCK_MARKER}${project}\n${code}`);

                // Need to call this after every set value.
                editorHideFirstLine(editor);
            },
            handleLoadFailure: () => {
                console.error('Failed to load code.');
                let source;
                try {
                    source = JSON.parse(initialProject.project);
                    source = JSON.stringify(source, null, 2);
                } catch {
                    source = initialProject.project;
                }

                editor?.setValue(
                    '# The program failed to load. Please open an issue over at:\n#\n' +
                        '#    https://github.com/pybricks/support\n#\n' +
                        '# and include the following snippet in your post:\n#\n' +
                        '```\n' +
                        source +
                        '\n```',
                );
                // HACK. Should instead gracefully handle this problem and only
                // refresh tab
                setTimeout(() => window.location.reload(), 1000);
            },
            handleHelpClick: (_url: string, reference: string) => {
                const Url = getDocsUrl(reference, _url);
                console.log('handleHelpClick', Url);
                setLastDocsPage(`${docsPathPrefix}${Url}`);
                setIsSettingShowDocsEnabled(true);
            },
            toggleDocs: () => {
                // FIXME: force rerender another way
                // setEditorSplit(editorSplit + 0.001);
                toggleIsSettingShowDocsEnabled();
            },
            toggleCode: () => {
                togglePreview();
            },
        };
        editor?.revealLine(0);
        editor?.updateOptions({ readOnly: true });
        const workspaceID = injectPybricksBlocks(
            blockEditorRef.current,
            initialProject.project,
            projectCallbacks,
            undefined,
            'en',
            'static/blockly-media/',
        );

        const workspace = Blockly.Workspace.getById(workspaceID);
        setBlockEditor(workspace as Blockly.WorkspaceSvg);

        return () => {
            setBlockEditor(undefined);
            workspace?.dispose();
        };
    });

    const resizeBlocks = (split?: number) => {
        if (split) {
            // setEditorSplit(split);
        }

        if (blockEditor) {
            Blockly.svgResize(blockEditor);
        }
        // codeEditor?.layout();
    };

    // resizeBlocks();

    return (
        <ResizeSensor onResize={() => resizeBlocks()}>
            <div
                className="pb-editor-codearea"
                style={{ position: 'relative', width: '100%' }}
            >
                <div
                    ref={blockEditorRef}
                    // className="pb-editor-codearea"
                    style={{
                        // position: 'relative',
                        height: `100%`,
                        width: '100%',
                    }}
                />
            </div>
        </ResizeSensor>
    );
};

export default BlocksEditor;
