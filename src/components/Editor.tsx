// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import React, { ReactElement } from 'react';
import AceEditor from 'react-ace';
import { ReactReduxContext } from 'react-redux';
import { setEditSession } from '../actions/editor';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';

class Editor extends React.Component {
    render(): JSX.Element {
        return (
            <ReactReduxContext.Consumer>
                {({ store }): ReactElement => (
                    <AceEditor
                        mode="python"
                        theme="xcode"
                        fontSize="16pt"
                        width="100"
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
                            store.dispatch(setEditSession(e?.session));
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
                )}
            </ReactReduxContext.Consumer>
        );
    }
}

export default Editor;
