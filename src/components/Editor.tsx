// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import {
    ContextMenuTarget,
    Menu,
    MenuDivider,
    MenuItem,
    ResizeSensor,
} from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import { Ace, config } from 'ace-builds';
import React from 'react';
import AceEditor from 'react-ace';
import { IAceEditor } from 'react-ace/lib/types';
import { connect } from 'react-redux';
import { setEditSession, storageChanged } from '../actions/editor';
import { compile } from '../actions/mpy';
import { toggleBoolean } from '../actions/settings';
import { RootState } from '../reducers';
import { SettingId } from '../settings/user';
import { isMacOS } from '../utils/os';
import { EditorStringId } from './editor-i18n';
import en from './editor-i18n.en.json';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-tomorrow_night_eighties';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/ext-keybinding_menu';
import 'ace-builds/src-noconflict/ext-language_tools';

import './editor-snippets';
import './editor.scss';

type StateProps = {
    darkMode: boolean;
    showDocs: boolean;
};

type DispatchProps = {
    onSessionChanged: (session?: Ace.EditSession) => void;
    onProgramStorageChanged: (newValue: string) => void;
    onCheck: (script: string) => void;
    onToggleDocs: () => void;
};

type EditorProps = StateProps & DispatchProps & WithI18nProps;

@ContextMenuTarget
class Editor extends React.Component<EditorProps> {
    private editorRef: React.RefObject<AceEditor>;
    private keyBindings?: Array<{ key: string; command: string }>;

    constructor(props: EditorProps) {
        super(props);
        this.editorRef = React.createRef();
    }

    /** convenience property for getting Ace editor object */
    private get editor(): IAceEditor | undefined {
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
            <div className="h-100">
                <ResizeSensor onResize={(): void => this.editor?.resize()}>
                    <AceEditor
                        ref={this.editorRef}
                        mode="python"
                        theme={darkMode ? 'tomorrow_night_eighties' : 'xcode'}
                        fontSize="16pt"
                        width="100%"
                        height="100%"
                        focus={true}
                        placeholder={i18n.translate(EditorStringId.Placeholder)}
                        defaultValue={localStorage.getItem('program') || undefined}
                        editorProps={{ $blockScrolling: true }}
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: true,
                        }}
                        onLoad={(e): void => {
                            // default binding is F2 which conflicts with 'check'
                            e.commands.byName['toggleFoldWidget'].bindKey = {
                                win: 'Shift-F2',
                                mac: 'Shift-F2',
                            };

                            // we want to use Ctrl-D for docs toggle, so change
                            // delete line to VSCode default
                            e.commands.byName['removeline'].bindKey = {
                                win: 'Ctrl-Shift-K',
                                mac: 'Cmd-Shift-K',
                            };

                            config.loadModule(
                                'ace/ext/menu_tools/get_editor_keyboard_shortcuts',
                                (m) => {
                                    this.keyBindings = m.getEditorKeybordShortcuts(e);
                                },
                            );

                            config.loadModule('ace/ext/keybinding_menu', (m) =>
                                m.init(e),
                            );
                        }}
                        onFocus={(_, e): void => {
                            onSessionChanged(e?.session);
                        }}
                        onChange={(v): void => {
                            localStorage.setItem('program', v);
                        }}
                        commands={[
                            {
                                // command to check current program for errors
                                name: 'check',
                                bindKey: { win: 'F2', mac: 'F2' },
                                exec: (editor) => onCheck(editor.getValue()),
                            },
                            {
                                name: 'toggleDocs',
                                bindKey: { win: 'Ctrl-D', mac: 'Cmd-D' },
                                exec: () => onToggleDocs(),
                            },
                            {
                                name: 'save',
                                bindKey: { win: 'Ctrl-S', mac: 'Cmd-S' },
                                exec: (): void => {
                                    // We already automatically save the file
                                    // to local storage after every change, so
                                    // CTRL+S is ignored
                                    console.debug('CTRL+S ignored');
                                },
                            },
                        ]}
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
                        const selected = this.editor?.getSelectedText();
                        if (selected) {
                            navigator.clipboard.writeText(selected);
                        }
                    }}
                    text={i18n.translate(EditorStringId.Copy)}
                    icon="duplicate"
                    label={isMacOS() ? 'Cmd-C' : 'Ctrl-C'}
                    disabled={this.editor?.getSelection().isEmpty()}
                />
                <MenuItem
                    onClick={async (): Promise<void> => {
                        this.editor?.execCommand(
                            'paste',
                            await navigator.clipboard.readText(),
                        );
                    }}
                    text={i18n.translate(EditorStringId.Paste)}
                    icon="clipboard"
                    label={isMacOS() ? 'Cmd-V' : 'Ctrl-V'}
                />
                <MenuItem
                    onClick={() => this.editor?.selectAll()}
                    text={i18n.translate(EditorStringId.SelectAll)}
                    icon="blank"
                    label={isMacOS() ? 'Cmd-A' : 'Ctrl-A'}
                />
                <MenuDivider />
                <MenuItem
                    onClick={(): void => this.editor?.undo()}
                    text={i18n.translate(EditorStringId.Undo)}
                    icon="undo"
                    label={this.keyBindings?.find((x) => x.command === 'undo')?.key}
                    disabled={!this.editor?.session.getUndoManager().canUndo()}
                />
                <MenuItem
                    onClick={(): void => this.editor?.redo()}
                    text={i18n.translate(EditorStringId.Redo)}
                    icon="redo"
                    label={this.keyBindings?.find((x) => x.command === 'redo')?.key}
                    active
                    disabled={!this.editor?.session.getUndoManager().canRedo()}
                />
            </Menu>
        );
    }
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
    onCheck: compile,
    onToggleDocs: () => toggleBoolean(SettingId.ShowDocs),
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n({ id: 'editor', fallback: en, translations: { en } })(Editor));
