// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import { ContextMenu2, ResizeSensor2 } from '@blueprintjs/popover2';
import { I18n, useI18n } from '@shopify/react-i18n';
import tomorrowNightEightiesTheme from 'monaco-themes/themes/Tomorrow-Night-Eighties.json';
import xcodeTheme from 'monaco-themes/themes/Xcode_default.json';
import React, { useState } from 'react';
import MonacoEditor, { monaco } from 'react-monaco-editor';
import { useDispatch } from 'react-redux';
import { useTernaryDarkMode } from 'usehooks-ts';
import { IDisposable } from 'xterm';
import { fileStorageWriteFile } from '../fileStorage/actions';
import { compile } from '../mpy/actions';
import { settingsToggleShowDocs } from '../settings/actions';
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

type EditorContextMenuProps = { editor: EditorType; i18n: I18n };

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

type EditorProps = { onEditorChanged?: (editor: EditorType) => void };

const Editor: React.VoidFunctionComponent<EditorProps> = ({ onEditorChanged }) => {
    const dispatch = useDispatch();

    const [editor, setEditor] = useState<EditorType>(null);
    const { isDarkMode } = useTernaryDarkMode();

    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();

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
                    width="100%"
                    height="100%"
                    options={{
                        fontSize: 18,
                        minimap: { enabled: false },
                        contextmenu: false,
                        rulers: [80],
                    }}
                    editorDidMount={(editor) => {
                        const subscriptions = new Array<IDisposable>();
                        // FIXME: editor does not respond to changes in i18n
                        subscriptions.push(
                            new UntitledHintContribution(
                                editor,
                                i18n.translate(I18nId.Placeholder),
                            ),
                        );
                        subscriptions.push(
                            editor.addAction({
                                id: 'pybricks.action.toggleDocs',
                                label: i18n.translate(I18nId.ToggleDocs),
                                run: () => {
                                    // we have to use dispatch here instead of
                                    // toggleIsSettingShowDocsEnabled since this
                                    // isn't updated on state changes
                                    dispatch(settingsToggleShowDocs());
                                },
                                keybindings: [
                                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD,
                                ],
                            }),
                        );
                        subscriptions.push(
                            editor.addAction({
                                id: 'pybricks.action.check',
                                label: i18n.translate(I18nId.Check),
                                // REVISIT: the compile options here might need to be changed - hopefully there is
                                // one setting that works for all hub types for cases where we aren't connected.
                                run: (e) => {
                                    dispatch(compile(e.getValue(), []));
                                },
                                keybindings: [monaco.KeyCode.F2],
                            }),
                        );
                        subscriptions.push(
                            editor.addAction({
                                id: 'pybricks.action.save',
                                label: 'Unused',
                                run: () => {
                                    // We already automatically save the file
                                    // to local storage after every change, so
                                    // CTRL+S is ignored
                                    console.debug('Ctrl-S ignored');
                                },
                                keybindings: [
                                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
                                ],
                            }),
                        );
                        editor.onDidDispose(() =>
                            subscriptions.forEach((s) => s.dispose()),
                        );
                        editor.focus();
                        setEditor(editor);
                        if (onEditorChanged) {
                            onEditorChanged(editor);
                        }
                    }}
                    // REVIST: need to ensure we have exclusive access to file
                    onChange={(v) => dispatch(fileStorageWriteFile('main.py', v))}
                />
            </ContextMenu2>
        </ResizeSensor2>
    );
};

export default Editor;
