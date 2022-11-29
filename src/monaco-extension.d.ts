// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

// exposes some monaco editor internal functions

import {} from 'monaco-editor';

declare module 'monaco-editor' {
    export namespace editor {
        export interface ITextModel {
            // https://github.com/microsoft/vscode/blob/d54c705f6567958a732ac88b1c3ec4d2303fb026/src/vs/editor/common/model.ts#L1135
            canUndo: () => boolean;
            // https://github.com/microsoft/vscode/blob/d54c705f6567958a732ac88b1c3ec4d2303fb026/src/vs/editor/common/model.ts#L1148
            canRedo: () => boolean;
        }
    }
}
