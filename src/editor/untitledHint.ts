// Copied from https://github.com/microsoft/vscode/blob/167b197e767beb791e3d191c24efb97865a98b42/src/vs/workbench/browser/parts/editor/untitledHint.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { monaco } from 'react-monaco-editor';

export class UntitledHintContribution implements monaco.editor.IEditorContribution {
    public static readonly ID = 'editor.contrib.untitledHint';

    private toDispose: monaco.IDisposable[];
    private untitledHintContentWidget: UntitledHintContentWidget | undefined;

    constructor(
        private readonly editor: monaco.editor.ICodeEditor,
        private readonly placeholder: string,
    ) {
        this.toDispose = [];
        this.toDispose.push(editor.onDidChangeModel(() => this.update()));
        this.update();
    }

    private update(): void {
        this.untitledHintContentWidget?.dispose();
        this.untitledHintContentWidget = new UntitledHintContentWidget(
            this.editor,
            this.placeholder,
        );
    }

    dispose(): void {
        this.toDispose.forEach((d) => d.dispose());
        this.untitledHintContentWidget?.dispose();
    }
}

class UntitledHintContentWidget implements monaco.editor.IContentWidget {
    private static readonly ID = 'editor.widget.untitledHint';

    private domNode: HTMLElement | undefined;
    private toDispose: monaco.IDisposable[];

    constructor(
        private readonly editor: monaco.editor.ICodeEditor,
        private readonly placeholder: string,
    ) {
        this.toDispose = [];
        this.toDispose.push(
            editor.onDidChangeModelContent(() => this.onDidChangeModelContent()),
        );
        this.onDidChangeModelContent();
    }

    private onDidChangeModelContent(): void {
        if (this.editor.getValue() === '') {
            this.editor.addContentWidget(this);
        } else {
            this.editor.removeContentWidget(this);
        }
    }

    getId(): string {
        return UntitledHintContentWidget.ID;
    }

    // Select a language to get started. Start typing to dismiss, or don't show this again.
    getDomNode(): HTMLElement {
        if (!this.domNode) {
            this.domNode = document.createElement('div');
            this.domNode.textContent = this.placeholder;
            this.domNode.className = 'pb-editor-placeholder';
            this.editor.applyFontInfo(this.domNode);
        }

        return this.domNode;
    }

    getPosition(): monaco.editor.IContentWidgetPosition | null {
        return {
            position: { lineNumber: 1, column: 1 },
            preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
        };
    }

    dispose(): void {
        this.editor.removeContentWidget(this);
        this.toDispose.forEach((d) => d.dispose());
    }
}
