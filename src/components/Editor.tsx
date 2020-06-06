// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { ResizeSensor } from '@blueprintjs/core';
import { Ace } from 'ace-builds';
import React from 'react';
import AceEditor from 'react-ace';
import { connect } from 'react-redux';
import { Action, Dispatch } from '../actions';
import { setEditSession } from '../actions/editor';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';

type DispatchProps = { onSessionChanged: (session?: Ace.EditSession) => void };

type EditorProps = DispatchProps;

class Editor extends React.Component<EditorProps> {
    private editorRef: React.RefObject<AceEditor>;

    constructor(props: EditorProps) {
        super(props);
        this.editorRef = React.createRef();
    }

    render(): JSX.Element {
        return (
            <ResizeSensor
                onResize={(): void => this.editorRef.current?.editor?.resize()}
            >
                <div className="editor-container">
                    <AceEditor
                        ref={this.editorRef}
                        mode="python"
                        theme="xcode"
                        fontSize="16pt"
                        width="100%"
                        height="100%"
                        focus={true}
                        placeholder="Write your program here..."
                        defaultValue={localStorage.getItem('program') || undefined}
                        editorProps={{ $blockScrolling: true }}
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                        }}
                        onFocus={(_, e): void => {
                            this.props.onSessionChanged(e?.session);
                        }}
                        onChange={(v): void => localStorage.setItem('program', v)}
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
                </div>
            </ResizeSensor>
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onSessionChanged: (s): Action => dispatch(setEditSession(s)),
});

export default connect(undefined, mapDispatchToProps)(Editor);
