// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Menu, MenuDivider, MenuItem, ResizeSensor } from '@blueprintjs/core';
// importing this way due to https://github.com/palantir/blueprint/issues/3891
import { ContextMenuTarget } from '@blueprintjs/core/lib/esnext/components/context-menu/contextMenuTarget';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import { Ace, config } from 'ace-builds';
import React from 'react';
import AceEditor from 'react-ace';
import { IAceEditor } from 'react-ace/lib/types';
import { connect } from 'react-redux';
import { Action, Dispatch } from '../actions';
import { setEditSession, storageChanged } from '../actions/editor';
import { EditorStringId } from './editor';
import en from './editor.en.json';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/ext-keybinding_menu';
import 'ace-builds/src-noconflict/ext-language_tools';

type DispatchProps = {
    onSessionChanged: (session?: Ace.EditSession) => void;
    onProgramStorageChanged: (newValue: string) => void;
};

type EditorProps = DispatchProps & WithI18nProps;

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
        const { i18n, onSessionChanged } = this.props;
        return (
            <div className="h-100">
                <ResizeSensor onResize={(): void => this.editor?.resize()}>
                    <AceEditor
                        ref={this.editorRef}
                        mode="python"
                        theme="xcode"
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
                        }}
                        onLoad={(e): void => {
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
                    label={/mac/i.test(navigator.platform) ? 'Cmd-C' : 'Ctrl-C'}
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
                    label={/mac/i.test(navigator.platform) ? 'Cmd-V' : 'Ctrl-V'}
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

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onSessionChanged: (s): Action => dispatch(setEditSession(s)),
    onProgramStorageChanged: (v): Action => dispatch(storageChanged(v)),
});

export default connect(
    undefined,
    mapDispatchToProps,
)(withI18n({ id: 'editor', fallback: en, translations: { en } })(Editor));
