// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { ContextMenu2, ResizeSensor2 } from '@blueprintjs/popover2';
import { I18n, useI18n } from '@shopify/react-i18n';
import tomorrowNightEightiesTheme from 'monaco-themes/themes/Tomorrow-Night-Eighties.json';
import xcodeTheme from 'monaco-themes/themes/Xcode_default.json';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MonacoEditor, {
    ChangeHandler,
    EditorDidMount,
    EditorWillUnmount,
    monaco,
} from 'react-monaco-editor';
import { useDispatch } from 'react-redux';
import { useTernaryDarkMode } from 'usehooks-ts';
import { IDisposable } from 'xterm';
import { fileStorageWriteFile } from '../fileStorage/actions';
import { compile } from '../mpy/actions';
import { useSettingIsShowDocsEnabled } from '../settings/hooks';
import { isMacOS } from '../utils/os';
import { I18nId } from './i18n';
import * as pybricksMicroPython from './pybricksMicroPython';
import { UntitledHintContribution } from './untitledHint';

import './editor.scss';

/**
 * The editor type. Null indicates no current editor.
 */
export type EditorType = monaco.editor.ICodeEditor | null;

const pybricksMicroPythonId = 'pybricks-micropython';
monaco.languages.register({ id: pybricksMicroPythonId });

const toDispose = new Array<IDisposable>();
toDispose.push(
    monaco.languages.setLanguageConfiguration(
        pybricksMicroPythonId,
        pybricksMicroPython.conf,
    ),
    monaco.languages.setMonarchTokensProvider(
        pybricksMicroPythonId,
        pybricksMicroPython.language,
    ),
    monaco.languages.registerCompletionItemProvider(
        pybricksMicroPythonId,
        pybricksMicroPython.templateSnippetCompletions,
    ),
);

// https://webpack.js.org/api/hot-module-replacement/
if (module.hot) {
    module.hot.dispose(() => {
        toDispose.forEach((s) => s.dispose());
    });
}

const tomorrowNightEightiesId = 'tomorrow-night-eighties';
monaco.editor.defineTheme(
    tomorrowNightEightiesId,
    tomorrowNightEightiesTheme as monaco.editor.IStandaloneThemeData,
);

const xcodeId = 'xcode';
monaco.editor.defineTheme(xcodeId, xcodeTheme as monaco.editor.IStandaloneThemeData);

type EditorContextMenuProps = {
    /** The editor. */
    editor?: monaco.editor.IStandaloneCodeEditor;
    /** Translation context. */
    i18n: I18n;
};

const EditorContextMenu: React.VoidFunctionComponent<EditorContextMenuProps> = ({
    editor,
    i18n,
}) => {
    const hasEditor = editor !== null;

    const selection = editor?.getSelection();
    const hasSelection = selection && !selection.isEmpty();

    const model = editor?.getModel();
    const canUndo = model && model.canUndo();
    const canRedo = model && model.canRedo();

    return (
        <Menu>
            <MenuItem
                onClick={() => {
                    editor?.focus();
                    editor?.trigger(null, 'editor.action.clipboardCopyAction', null);
                }}
                text={i18n.translate(I18nId.Copy)}
                icon="duplicate"
                label={isMacOS() ? 'Cmd-C' : 'Ctrl-C'}
                disabled={!hasSelection}
            />
            <MenuItem
                onClick={() => {
                    editor?.focus();
                    editor?.trigger(null, 'editor.action.clipboardPasteAction', null);
                }}
                text={i18n.translate(I18nId.Paste)}
                icon="clipboard"
                label={isMacOS() ? 'Cmd-V' : 'Ctrl-V'}
                disabled={!hasEditor}
            />
            <MenuItem
                onClick={() => {
                    editor?.focus();
                    editor?.trigger(null, 'editor.action.selectAll', null);
                }}
                text={i18n.translate(I18nId.SelectAll)}
                icon="blank"
                label={isMacOS() ? 'Cmd-A' : 'Ctrl-A'}
                disabled={!hasEditor}
            />
            <MenuDivider />
            <MenuItem
                onClick={() => {
                    editor?.focus();
                    editor?.trigger(null, 'undo', null);
                }}
                text={i18n.translate(I18nId.Undo)}
                icon="undo"
                label={isMacOS() ? 'Cmd-Z' : 'Ctrl-Z'}
                disabled={!canUndo}
            />
            <MenuItem
                onClick={() => {
                    editor?.focus();
                    editor?.trigger(null, 'redo', null);
                }}
                text={i18n.translate(I18nId.Redo)}
                icon="redo"
                label={isMacOS() ? 'Cmd-Shift-Z' : 'Ctrl-Shift-Z'}
                disabled={!canRedo}
            />
        </Menu>
    );
};

/**
 * Wrapper around useEffect() hook that uses {@link maybeEditor}.
 * @param maybeEditor The editor or undefined if the editor is not mounted.
 * @param callback The callback to call when editor is defined and when {@link deps} change.
 * @param deps Additional dependencies used in the {@link callback}.
 */
function useEditor(
    maybeEditor: monaco.editor.IStandaloneCodeEditor | undefined,
    callback: (
        editor: monaco.editor.IStandaloneCodeEditor,
    ) => ReturnType<React.EffectCallback>,
    deps: React.DependencyList,
): void {
    useEffect(() => {
        if (!maybeEditor) {
            return;
        }

        return callback(maybeEditor);
    }, [maybeEditor, ...deps]);
}

/**
 * Hook for adding actions to the editor.
 * @param maybeEditor The editor or undefined if the editor is not mounted.
 * @param createAction A callback to create a new action.
 * @param deps Additional dependencies used in {@link createAction}.
 */
function useEditorAction(
    maybeEditor: monaco.editor.IStandaloneCodeEditor | undefined,
    createAction: () => monaco.editor.IActionDescriptor,
    deps: React.DependencyList,
): void {
    useEditor(
        maybeEditor,
        (editor) => {
            const subscription = editor.addAction(createAction());
            return () => subscription.dispose();
        },
        deps,
    );
}

type EditorProps = { onEditorChanged?: (editor: EditorType) => void };

const Editor: React.VoidFunctionComponent<EditorProps> = ({ onEditorChanged }) => {
    const dispatch = useDispatch();

    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();
    const { toggleIsSettingShowDocsEnabled } = useSettingIsShowDocsEnabled();
    const { isDarkMode } = useTernaryDarkMode();

    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();

    const options = useMemo<monaco.editor.IStandaloneEditorConstructionOptions>(
        () => ({
            fontSize: 18,
            minimap: { enabled: false },
            contextmenu: false,
            rulers: [80],
        }),
        [],
    );

    useEditor(
        editor,
        (editor) => {
            const contrib = new UntitledHintContribution(
                editor,
                i18n.translate(I18nId.Placeholder),
            );
            return () => contrib.dispose();
        },
        [i18n],
    );

    useEditorAction(
        editor,
        () => ({
            id: 'pybricks.action.toggleDocs',
            label: i18n.translate(I18nId.ToggleDocs),
            run: () => toggleIsSettingShowDocsEnabled(),
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD],
        }),
        [i18n, toggleIsSettingShowDocsEnabled],
    );

    useEditorAction(
        editor,
        () => ({
            id: 'pybricks.action.check',
            label: i18n.translate(I18nId.Check),
            // REVISIT: the compile options here might need to be changed - hopefully there is
            // one setting that works for all hub types for cases where we aren't connected.
            run: (e) => {
                dispatch(compile(e.getValue(), []));
            },
            keybindings: [monaco.KeyCode.F2],
        }),
        [i18n, dispatch],
    );

    useEditorAction(
        editor,
        () => ({
            id: 'pybricks.action.save',
            label: 'Unused',
            run: () => {
                // We already automatically save the file after every change,
                // so CTRL+S is ignored
                console.debug('Ctrl-S ignored');
            },
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        }),
        [],
    );

    const handleEditorDidMount = useCallback<EditorDidMount>(
        (editor) => {
            editor.focus();
            setEditor(editor);

            if (onEditorChanged) {
                onEditorChanged(editor);
            }
        },
        [onEditorChanged, setEditor],
    );

    const handleEditorWillUnmount = useCallback<EditorWillUnmount>(() => {
        if (onEditorChanged) {
            onEditorChanged(null);
        }

        setEditor(undefined);
    }, [onEditorChanged, setEditor]);

    const handleChange = useCallback<ChangeHandler>(
        // REVISIT: need to ensure we have exclusive access to file
        (v) => dispatch(fileStorageWriteFile('main.py', v)),
        [dispatch],
    );

    return (
        <ResizeSensor2 onResize={() => editor?.layout()}>
            <ContextMenu2
                className="h-100"
                // NB: we have to create a new context menu each time it is
                // shown in order to get some state, like canUndo and canRedo
                // that don't have events to monitor changes.
                content={() => <EditorContextMenu editor={editor} i18n={i18n} />}
                popoverProps={{ onClosed: () => editor?.focus() }}
            >
                <MonacoEditor
                    language={pybricksMicroPythonId}
                    theme={isDarkMode ? tomorrowNightEightiesId : xcodeId}
                    options={options}
                    editorDidMount={handleEditorDidMount}
                    editorWillUnmount={handleEditorWillUnmount}
                    onChange={handleChange}
                />
            </ContextMenu2>
        </ResizeSensor2>
    );
};

export default Editor;
