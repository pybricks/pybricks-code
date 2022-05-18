// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import dexieObservable from 'dexie-observable';
import { monaco } from 'react-monaco-editor';

// HACK: Using window.name to detect page reloads vs. tab duplication.
// window.name will persist across page reloads but will be set back to ''
// when a page is duplicated. This will avoid attempting to open files that
// are already open in the page that was duplicated. sessionStorage is
// duplicated when a window is duplicated, and we don't want to try to
// duplicate open files since that would just cause errors since the files
// are already open in another window.
// istanbul ignore else
if (window.name === '') {
    window.name = dexieObservable.createUUID();
}

/**
 * Manages the active file history for an editor.
 *
 * The history is stored per-editor and per-browser window in a manner such
 * that it will persist across page reloads but be unique per window, including
 * duplicated windows.
 */
export class ActiveFileHistoryManager {
    private readonly history = new Array<string>();
    private readonly storageKey: string;

    public constructor(id: string) {
        this.storageKey = `editor.activeFileHistory.${window.name}.${id}`;
    }

    /**
     * Gets the stored data.
     *
     * This may be nothing if storage fails or storage contains invalid data
     * even though there is valid history in memory. It will also return data
     * different from the in-memory list if storage has been modified externally
     * or if no items have been pushed yet.
     *
     * It only makes sense to call this right after a new
     * {@link ActiveFileHistoryManager} has been created to get the old values
     * from the previous window reload.
     */
    public *getFromStorage(): IterableIterator<string> {
        try {
            const savedActiveFileHistory = JSON.parse(
                sessionStorage.getItem(this.storageKey) || '[]',
            );

            // istanbul ignore if
            if (!(savedActiveFileHistory instanceof Array)) {
                throw new Error('savedActiveFileHistory is not an array');
            }

            // this should restore all previously open files in the same order
            // the were last used (which may be different from the order in which
            // they were originally opened)
            for (const item of savedActiveFileHistory) {
                // istanbul ignore if
                if (typeof item !== 'string') {
                    console.error(
                        `ActiveFileHistoryManager: skipping non-string item: ${item}`,
                    );
                    continue;
                }

                yield item;
            }
        } catch (err) {
            // istanbul ignore next: not a critical error
            console.error(`failed to get ${this.storageKey}:`, err);
        }
    }

    /**
     * Pushes a file on top of the stack. If the file was already in the stack,
     * it is moved to the top.
     * @param fileName: the file name
     */
    public push(fileName: string): void {
        const index = this.history.indexOf(fileName);

        if (index >= 0) {
            this.history.splice(index, 1);
        }

        this.history.push(fileName);

        try {
            sessionStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (err) {
            // istanbul ignore next: not a critical failure
            console.error(`failed to store ${this.storageKey}:`, err);
        }
    }

    /**
     * Pops an item from the list.
     *
     * The item is not necessarily the (top) active item.
     * @param fileName The file to remove.
     * @returns The new active file if {@link fileName} was the active file or
     * undefined if {@link fileName} was not the active file (or not in the
     * the history at all.)
     */
    public pop(fileName: string): string | undefined {
        const index = this.history.indexOf(fileName);

        if (index < 0) {
            // the file is not in history
            return undefined;
        }

        const wasActiveFile = this.history.at(-1) === fileName;
        this.history.splice(index, 1);

        try {
            sessionStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (err) {
            // istanbul ignore next: not a critical failure
            console.error(`failed to store ${this.storageKey}:`, err);
        }

        return wasActiveFile ? this.history.at(-1) : undefined;
    }
}

export type OpenFileInfo = {
    /** The model. */
    readonly model: monaco.editor.ITextModel;
    /** The view state. */
    viewState: monaco.editor.ICodeEditorViewState | null;
};

export class OpenFileManager {
    private readonly map: Map<string, OpenFileInfo> = new Map();

    public add(
        fileName: string,
        model: monaco.editor.ITextModel,
        viewState: monaco.editor.ICodeEditorViewState | null,
    ): void {
        // istanbul ignore if: bug if hit
        if (this.map.has(fileName)) {
            throw new Error(`bug: key '${fileName}' already exists in the mpa`);
        }

        this.map.set(fileName, { model, viewState });
    }

    public remove(fileName: string): void {
        this.map.delete(fileName);
    }

    public has(fileName: string): boolean {
        return this.map.has(fileName);
    }

    public get(fileName: string): OpenFileInfo | undefined {
        return this.map.get(fileName);
    }

    /**
     * Modifies the view state of {@link fileName} if it is present, otherwise
     * does nothing.
     * @param fileName The lookup key.
     * @param viewState The new view state.
     */
    public updateViewState(
        fileName: string,
        viewState: monaco.editor.ICodeEditorViewState | null,
    ): void {
        const info = this.map.get(fileName);

        if (!info) {
            return;
        }

        info.viewState = viewState;
    }
}
