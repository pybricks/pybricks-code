import React, { ReactElement } from 'react';
import { ReactReduxContext } from 'react-redux';
import AceEditor from 'react-ace';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { setEditSession } from '../actions/editor';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import 'ace-builds/src-min-noconflict/ext-language_tools';

class Editor extends React.Component {
    render(): JSX.Element {
        return (
            <Row className="px-2 py-4 bg-primary">
                <Col>
                    <ReactReduxContext.Consumer>
                        {({ store }): ReactElement => (
                            <AceEditor
                                mode="python"
                                theme="xcode"
                                fontSize="16pt"
                                width="100"
                                focus={true}
                                placeholder="Write your program here..."
                                defaultValue={
                                    localStorage.getItem('program') || undefined
                                }
                                editorProps={{ $blockScrolling: true }}
                                setOptions={{
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: true,
                                }}
                                onFocus={(_, e): void => {
                                    store.dispatch(setEditSession(e?.session));
                                }}
                                onChange={(v): void =>
                                    localStorage.setItem('program', v)
                                }
                            />
                        )}
                    </ReactReduxContext.Consumer>
                </Col>
            </Row>
        );
    }
}

export default Editor;
