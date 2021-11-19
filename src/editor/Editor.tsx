// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import { Menu, MenuDivider, MenuItem, ResizeSensor } from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import tomorrowNightEightiesTheme from 'monaco-themes/themes/Tomorrow-Night-Eighties.json';
import xcodeTheme from 'monaco-themes/themes/Xcode_default.json';
import React from 'react';
import MonacoEditor, { monaco } from 'react-monaco-editor';
import { connect } from 'react-redux';
import { IDisposable } from 'xterm';
import { compile } from '../mpy/actions';
import { RootState } from '../reducers';
import { toggleBoolean } from '../settings/actions';
import { BooleanSettingId } from '../settings/defaults';
import { IContextMenuTarget, handleContextMenu } from '../utils/IContextMenuTarget';
import { isMacOS } from '../utils/os';
import { setEditSession, storageChanged } from './actions';
import { EditorStringId } from './i18n';
import en from './i18n.en.json';
import * as pybricksMicroPython from './pybricksMicroPython';
import { UntitledHintContribution } from './untitledHint';

import './editor.scss';

type StateProps = {
    darkMode: boolean;
    showDocs: boolean;
};

type DispatchProps = {
    onSessionChanged: (session?: monaco.editor.ICodeEditor) => void;
    onProgramStorageChanged: (newValue: string) => void;
    onCheck: (script: string) => void;
    onToggleDocs: () => void;
};

type EditorProps = StateProps & DispatchProps & WithI18nProps;

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

class Editor extends React.Component<EditorProps> implements IContextMenuTarget {
    private editorRef: React.RefObject<MonacoEditor>;

    constructor(props: EditorProps) {
        super(props);
        this.editorRef = React.createRef();
    }

    /** convenience property for getting editor object */
    private get editor(): monaco.editor.IStandaloneCodeEditor | undefined {
        return this.editorRef.current?.editor;
    }

    onStorage = (e: StorageEvent): void => {
        if (
            e.key === 'program' &&
            e.newValue &&
            e.newValue !== this.editor?.getValue()
        ) {
            this.props.onProgramStorageChanged(e.newValue);
        }
    };

    componentDidMount(): void {
        window.addEventListener('storage', this.onStorage);
    }

    componentWillUnmount(): void {
        window.removeEventListener('storage', this.onStorage);
    }

    render(): JSX.Element {
        const { i18n, darkMode, onSessionChanged, onCheck, onToggleDocs } = this.props;
        return (
            <div className="h-100" onContextMenu={(e) => handleContextMenu(e, this)}>
                <ResizeSensor onResize={(): void => this.editor?.layout()}>
                    <MonacoEditor
                        ref={this.editorRef}
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
                        value={localStorage.getItem('program')}
                        editorDidMount={(e, _m): void => {
                            // FIXME: editor does not respond to changes in i18n
                            const untitledHintContribution =
                                new UntitledHintContribution(
                                    e,
                                    i18n.translate(EditorStringId.Placeholder),
                                );
                            e.onDidDispose(() => untitledHintContribution.dispose());
                            e.addAction({
                                id: 'pybricks.action.toggleDocs',
                                label: i18n.translate(EditorStringId.ToggleDocs),
                                run: () => onToggleDocs(),
                                keybindings: [
                                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD,
                                ],
                            });
                            e.addAction({
                                id: 'pybricks.action.check',
                                label: i18n.translate(EditorStringId.Check),
                                run: () => onCheck(e.getValue()),
                                keybindings: [monaco.KeyCode.F2],
                            });
                            e.addAction({
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
                            });
                            e.focus();
                            onSessionChanged(e);
                        }}
                        onChange={(v): void => {
                            localStorage.setItem('program', v);
                        }}
                    />
                </ResizeSensor>
            </div>
        );
    }

    renderContextMenu(): JSX.Element {
        const { i18n } = this.props;
        return (
            <Menu>
                <MenuItem
                    onClick={(): void => {
                        this.editor?.focus();
                        this.editor?.trigger(
                            null,
                            'editor.action.clipboardCopyAction',
                            null,
                        );
                    }}
                    text={i18n.translate(EditorStringId.Copy)}
                    icon="duplicate"
                    label={isMacOS() ? 'Cmd-C' : 'Ctrl-C'}
                    disabled={
                        !this.editor?.getSelection() ||
                        this.editor?.getSelection()?.isEmpty()
                    }
                />
                <MenuItem
                    onClick={async (): Promise<void> => {
                        this.editor?.focus();
                        this.editor?.trigger(
                            null,
                            'editor.action.clipboardPasteAction',
                            null,
                        );
                    }}
                    text={i18n.translate(EditorStringId.Paste)}
                    icon="clipboard"
                    label={isMacOS() ? 'Cmd-V' : 'Ctrl-V'}
                />
                <MenuItem
                    onClick={() => {
                        this.editor?.focus();
                        this.editor?.trigger(null, 'editor.action.selectAll', null);
                    }}
                    text={i18n.translate(EditorStringId.SelectAll)}
                    icon="blank"
                    label={isMacOS() ? 'Cmd-A' : 'Ctrl-A'}
                />
                <MenuDivider />
                <MenuItem
                    onClick={(): void => {
                        this.editor?.focus();
                        this.editor?.trigger(null, 'undo', null);
                    }}
                    text={i18n.translate(EditorStringId.Undo)}
                    icon="undo"
                    label={isMacOS() ? 'Cmd-Z' : 'Ctrl-Z'}
                    // @ts-expect-error internal method canUndo()
                    disabled={!this.editor?.getModel()?.canUndo()}
                />
                <MenuItem
                    onClick={(): void => {
                        this.editor?.focus();
                        this.editor?.trigger(null, 'redo', null);
                    }}
                    text={i18n.translate(EditorStringId.Redo)}
                    icon="redo"
                    label={isMacOS() ? 'Cmd-Shift-Z' : 'Ctrl-Shift-Z'}
                    // @ts-expect-error internal method canUndo()
                    disabled={!this.editor?.getModel()?.canRedo()}
                />
            </Menu>
        );
    }

    onContextMenuClose = () => {
        this.editor?.focus();
    };
}

const mapStateToProps = (state: RootState): StateProps => ({
    darkMode: state.settings.darkMode,
    showDocs: state.settings.showDocs,
});

const mapDispatchToProps: DispatchProps = {
    onSessionChanged: setEditSession,
    onProgramStorageChanged: storageChanged,
    // REVISIT: the options here might need to be changed - hopefully there is
    // one setting that works for all hub types for cases where we aren't connected.
    onCheck: (script) => compile(script, []),
    onToggleDocs: () => toggleBoolean(BooleanSettingId.ShowDocs),
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n({ id: 'editor', fallback: en, translations: { en } })(Editor));
