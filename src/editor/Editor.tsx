// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

import './editor.scss';
import {
    Button,
    Classes,
    IOverlayLifecycleProps,
    IconName,
    Menu,
    MenuDivider,
    MenuItem,
    Tab,
    TabId,
    Tabs,
} from '@blueprintjs/core';
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
import { useSelector } from '../reducers';
import { useSettingIsShowDocsEnabled } from '../settings/hooks';
import { isMacOS } from '../utils/os';
import { preventBrowserNativeContextMenu, useUniqueId } from '../utils/react';
import { editorActivateFile, editorCloseFile } from './actions';
import { I18nId } from './i18n';
import * as pybricksMicroPython from './pybricksMicroPython';
import { pybricksMicroPythonId } from './pybricksMicroPython';
import { UntitledHintContribution } from './untitledHint';

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
// istanbul ignore if: only used for development
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

type EditorContextMenuItemProps = Readonly<{
    /** The menu item label. */
    label: string;
    /** The menu item icon. */
    icon: IconName;
    /** The keyboard shortcut that triggers the same action. */
    keyboardShortcut: string;
    /** Controls the menu item disabled state. */
    disabled: boolean;
    /** A reference to the editor. */
    editor: monaco.editor.IStandaloneCodeEditor | undefined;
    /** The action handler ID passed to the editor.trigger() method. */
    editorAction: string;
}>;

const EditorContextMenuItem: React.VoidFunctionComponent<
    EditorContextMenuItemProps
> = ({ label, icon, keyboardShortcut, disabled, editor, editorAction }) => {
    const labelId = useUniqueId('pb-editor');

    return (
        <MenuItem
            role="menuitem"
            aria-labelledby={labelId}
            text={<span id={labelId}>{label}</span>}
            icon={icon}
            label={keyboardShortcut}
            disabled={disabled}
            onClick={() => {
                // have to focus first or the trigger won't work
                editor?.focus();
                editor?.trigger(null, editorAction, null);
            }}
        />
    );
};

type EditorContextMenuProps = {
    /** The editor. */
    editor: monaco.editor.IStandaloneCodeEditor | undefined;
    /** Translation context. */
    i18n: I18n;
};

const EditorContextMenu: React.VoidFunctionComponent<EditorContextMenuProps> = ({
    editor,
    i18n,
}) => {
    const selection = editor?.getSelection();
    const hasSelection = selection && !selection.isEmpty();

    const model = editor?.getModel();
    const canUndo = model && model.canUndo();
    const canRedo = model && model.canRedo();

    return (
        <Menu aria-label={i18n.translate(I18nId.ContextMenuLabel)} role="menu">
            <EditorContextMenuItem
                label={i18n.translate(I18nId.Copy)}
                icon="duplicate"
                keyboardShortcut={isMacOS() ? 'Cmd-C' : 'Ctrl-C'}
                disabled={!hasSelection}
                editor={editor}
                editorAction="editor.action.clipboardCopyAction"
            />
            <EditorContextMenuItem
                label={i18n.translate(I18nId.Paste)}
                icon="clipboard"
                keyboardShortcut={isMacOS() ? 'Cmd-V' : 'Ctrl-V'}
                disabled={!model}
                editor={editor}
                editorAction="editor.action.clipboardPasteAction"
            />
            <EditorContextMenuItem
                label={i18n.translate(I18nId.SelectAll)}
                icon="blank"
                keyboardShortcut={isMacOS() ? 'Cmd-A' : 'Ctrl-A'}
                disabled={!model}
                editor={editor}
                editorAction="editor.action.selectAll"
            />
            <MenuDivider />
            <EditorContextMenuItem
                label={i18n.translate(I18nId.Undo)}
                icon="undo"
                keyboardShortcut={isMacOS() ? 'Cmd-Z' : 'Ctrl-Z'}
                disabled={!canUndo}
                editor={editor}
                editorAction="undo"
            />
            <EditorContextMenuItem
                label={i18n.translate(I18nId.Redo)}
                icon="redo"
                keyboardShortcut={isMacOS() ? 'Cmd-Shift-Z' : 'Ctrl-Shift-Z'}
                disabled={!canRedo}
                editor={editor}
                editorAction="redo"
            />
        </Menu>
    );
};

type EditorTabsProps = Readonly<{
    /** Called when the selected tab changes. */
    onChange?: () => void;
    /** Translation context. */
    i18n: I18n;
}>;

const EditorTabs: React.VoidFunctionComponent<EditorTabsProps> = ({
    onChange,
    i18n,
}) => {
    const openFiles = useSelector((s) => s.editor.openFiles);
    const activeFile = useSelector((s) => s.editor.activeFile);
    const dispatch = useDispatch();

    const handleChange = useCallback(
        (newTabId: TabId) => {
            dispatch(editorActivateFile(newTabId as string));
            onChange?.();
        },
        [dispatch, onChange],
    );

    const labelId = useUniqueId('pb-editor');

    return (
        <Tabs
            className="pb-editor-tabs"
            selectedTabId={activeFile}
            onChange={handleChange}
        >
            {openFiles.map((fileName, i) => (
                <Tab
                    className="pb-editor-tab"
                    aria-labelledby={`${labelId}.${i}`}
                    key={i}
                    id={fileName}
                >
                    <span id={`${labelId}.${i}`}>{fileName}</span>
                    <Button
                        title={i18n.translate(I18nId.CloseFileTooltip, { fileName })}
                        minimal={true}
                        small={true}
                        icon={'cross'}
                        onClick={(e) => {
                            dispatch(editorCloseFile(fileName));
                            // prevent triggering Tabs onChange
                            e.stopPropagation();
                        }}
                    />
                </Tab>
            ))}
        </Tabs>
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

const Editor: React.VFC = () => {
    const dispatch = useDispatch();

    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();
    const { toggleIsSettingShowDocsEnabled } = useSettingIsShowDocsEnabled();
    const { isDarkMode } = useTernaryDarkMode();

    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useI18n();

    const options = useMemo<monaco.editor.IStandaloneEditorConstructionOptions>(
        () => ({
            model: null,
            fontSize: 18,
            minimap: { enabled: false },
            contextmenu: false,
            rulers: [80],
            lineNumbersMinChars: 4,
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

    useEditor(
        editor,
        (editor) => {
            // TODO: can be removed when https://github.com/microsoft/vscode/pull/146968 is merged
            // HACK: The editor eats context menu key press events event when
            // the monaco context menu is disabled so we have to fake it
            const subscription = editor.onKeyDown((e) => {
                if (e.keyCode === monaco.KeyCode.ContextMenu) {
                    e.target.dispatchEvent(
                        new MouseEvent('contextmenu', { bubbles: true }),
                    );
                }
            });

            return () => subscription.dispose();
        },
        [],
    );

    const handleEditorDidMount = useCallback<EditorDidMount>(
        (editor) => {
            editor.focus();
            setEditor(editor);
        },
        [setEditor],
    );

    const handleEditorWillUnmount = useCallback<EditorWillUnmount>(() => {
        setEditor(undefined);
    }, [setEditor]);

    const handleChange = useCallback<ChangeHandler>(
        // REVISIT: need to ensure we have exclusive access to file
        (v) => dispatch(fileStorageWriteFile('main.py', v)),
        [dispatch],
    );

    const popoverProps = useMemo<IOverlayLifecycleProps>(
        () => ({
            onOpened: (e) => {
                // a11y: focus the first item in the menu when the menu opens
                const menuItems = e.getElementsByClassName(Classes.MENU_ITEM);

                const firstItem = menuItems.item(0);

                // istanbul ignore if: should not be reachable
                if (!(firstItem instanceof HTMLElement)) {
                    console.log(`bug: firstItem is not an HTMLElement: ${firstItem}`);
                    return;
                }

                firstItem.focus();
            },
            onClosed: () => editor?.focus(),
        }),
        [editor],
    );

    return (
        <div className="pb-editor" onContextMenu={preventBrowserNativeContextMenu}>
            <EditorTabs onChange={() => editor?.focus()} i18n={i18n} />
            <ResizeSensor2 onResize={() => editor?.layout()}>
                <ContextMenu2
                    className="h-100"
                    // NB: we have to create a new context menu each time it is
                    // shown in order to get some state, like canUndo and canRedo
                    // that don't have events to monitor changes.
                    content={() => <EditorContextMenu editor={editor} i18n={i18n} />}
                    popoverProps={popoverProps}
                >
                    <MonacoEditor
                        theme={isDarkMode ? tomorrowNightEightiesId : xcodeId}
                        options={options}
                        editorDidMount={handleEditorDidMount}
                        editorWillUnmount={handleEditorWillUnmount}
                        onChange={handleChange}
                    />
                </ContextMenu2>
            </ResizeSensor2>
        </div>
    );
};

export default Editor;
