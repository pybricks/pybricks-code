// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

import './editor.scss';

import { UUID } from '../fileStorage';

export interface BlocksNewProject {
    UUID: UUID;
    project: string;
}

export const BLOCK_MARKER = '# pybricks blocks file:';

/**
 * Gets the template text for a Pybricks Blocks file.
 */
export function getBlocksFileTemplate(): string {
    // Relies on block module to provide default project.
    // In the future, we can expand this with various templates.
    return `${BLOCK_MARKER}\n`;
}

export const getBlockProjectInfo = (
    fileContents: string | undefined,
    activeFileUuid: UUID | null,
): BlocksNewProject | null => {
    if (!activeFileUuid || !fileContents) {
        return null;
    }

    const firstLine = fileContents.split('\n')[0] ?? '';
    if (!firstLine.startsWith(BLOCK_MARKER)) {
        return null;
    }

    const project = firstLine.slice(BLOCK_MARKER.length);
    try {
        const parsed = JSON.parse(project);
        if (parsed['blocks']) {
            return {
                UUID: activeFileUuid,
                project: project,
            };
        }
    } catch {
        // ignore
    }
    return {
        UUID: activeFileUuid,
        project: '',
    };
};
