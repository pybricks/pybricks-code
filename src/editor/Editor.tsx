// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { Menu, MenuDivider, MenuItem } from '@blueprintjs/core';
import {
    ContextMenu2,
    ContextMenu2ContentProps,
    ResizeSensor2,
} from '@blueprintjs/popover2';
import { useI18n } from '@shopify/react-i18n';
import tomorrowNightEightiesTheme from 'monaco-themes/themes/Tomorrow-Night-Eighties.json';
import xcodeTheme from 'monaco-themes/themes/Xcode_default.json';
import React, { useRef } from 'react';
import MonacoEditor, { monaco } from 'react-monaco-editor';
import { IDisposable } from 'xterm';
import { useDispatch } from '../actions';
import { fileStorageWriteFile } from '../fileStorage/actions';
import { compile } from '../mpy/actions';
import { useSelector } from '../reducers';
import { toggleBoolean } from '../settings/actions';
import { BooleanSettingId } from '../settings/defaults';
import { isMacOS } from '../utils/os';
import { setEditSession } from './actions';
import { EditorStringId } from './i18n';
import en from './i18n.en.json';
import * as pybricksMicroPython from './pybricksMicroPython';
import { UntitledHintContribution } from './untitledHint';

import './editor.scss';

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

const contextMenu = (_props: ContextMenu2ContentProps): JSX.Element => {
    const editor = useSelector((s) => s.editor.current);

    const [i18n] = useI18n({ id: 'editor', translations: { en }, fallback: en });

    return (
        <Menu>
            <MenuItem
                onClick={() => {
                    editor?.focus();
                    editor?.trigger(null, 'editor.action.clipboardCopyAction', null);
                }}
                text={i18n.translate(EditorStringId.Copy)}
                icon="duplicate"
                label={isMacOS() ? 'Cmd-C' : 'Ctrl-C'}
                disabled={!editor?.getSelection() || editor?.getSelection()?.isEmpty()}
            />
            <MenuItem
                onClick={() => {
                    editor?.focus();
                    editor?.trigger(null, 'editor.action.clipboardPasteAction', null);
                }}
                text={i18n.translate(EditorStringId.Paste)}
                icon="clipboard"
                label={isMacOS() ? 'Cmd-V' : 'Ctrl-V'}
            />
            <MenuItem
                onClick={() => {
                    editor?.focus();
                    editor?.trigger(null, 'editor.action.selectAll', null);
                }}
                text={i18n.translate(EditorStringId.SelectAll)}
                icon="blank"
                label={isMacOS() ? 'Cmd-A' : 'Ctrl-A'}
            />
            <MenuDivider />
            <MenuItem
                onClick={() => {
                    editor?.focus();
                    editor?.trigger(null, 'undo', null);
                }}
                text={i18n.translate(EditorStringId.Undo)}
                icon="undo"
                label={isMacOS() ? 'Cmd-Z' : 'Ctrl-Z'}
                // @ts-expect-error internal method canUndo()
                disabled={!editor?.getModel()?.canUndo()}
            />
            <MenuItem
                onClick={() => {
                    editor?.focus();
                    editor?.trigger(null, 'redo', null);
                }}
                text={i18n.translate(EditorStringId.Redo)}
                icon="redo"
                label={isMacOS() ? 'Cmd-Shift-Z' : 'Ctrl-Shift-Z'}
                // @ts-expect-error internal method canUndo()
                disabled={!editor?.getModel()?.canRedo()}
            />
        </Menu>
    );
};

const Editor: React.FunctionComponent = (_props) => {
    const editorRef = useRef<MonacoEditor>(null);
    const dispatch = useDispatch();

    const darkMode = useSelector((s) => s.settings.darkMode);

    const [i18n] = useI18n({ id: 'editor', translations: { en }, fallback: en });

    return (
        <ResizeSensor2 onResize={() => editorRef?.current?.editor?.layout()}>
            <ContextMenu2
                className="h-100"
                content={contextMenu}
                popoverProps={{ onClosed: () => editorRef.current?.editor?.focus() }}
            >
                <MonacoEditor
                    ref={editorRef}
                    language={pybricksMicroPythonId}
                    theme={darkMode ? tomorrowNightEightiesId : xcodeId}
                    width="100%"
                    height="100%"
                    options={{
                        fontSize: 18,
                        minimap: { enabled: false },
                        contextmenu: false,
                        rulers: [80],
                    }}
                    editorDidMount={(editor, _monaco) => {
                        const subscriptions = new Array<IDisposable>();
                        // FIXME: editor does not respond to changes in i18n
                        subscriptions.push(
                            new UntitledHintContribution(
                                editor,
                                i18n.translate(EditorStringId.Placeholder),
                            ),
                        );
                        subscriptions.push(
                            editor.addAction({
                                id: 'pybricks.action.toggleDocs',
                                label: i18n.translate(EditorStringId.ToggleDocs),
                                run: () => {
                                    dispatch(toggleBoolean(BooleanSettingId.ShowDocs));
                                },
                                keybindings: [
                                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD,
                                ],
                            }),
                        );
                        subscriptions.push(
                            editor.addAction({
                                id: 'pybricks.action.check',
                                label: i18n.translate(EditorStringId.Check),
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
                        dispatch(setEditSession(editor));
                    }}
                    // REVIST: need to ensure we have exclusive access to file
                    onChange={(v) => dispatch(fileStorageWriteFile('main.py', v))}
                />
            </ContextMenu2>
        </ResizeSensor2>
    );
};

export default Editor;
