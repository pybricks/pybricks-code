// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

// HACK: Prevent webpack from picking up all icons.
// https://github.com/palantir/blueprint/issues/2193

import {
    Add,
    Archive,
    Blank,
    Chat,
    ChevronDown,
    ChevronRight,
    Clipboard,
    Code,
    Cog,
    Cross,
    Disable,
    Document,
    Download,
    Duplicate,
    Edit,
    Error,
    Export,
    Heart,
    Help,
    Import,
    InfoSign,
    Lightbulb,
    Play,
    Plus,
    Redo,
    Refresh,
    Share,
    Tick,
    TickCircle,
    Trash,
    Undo,
    Virus,
} from '@blueprintjs/icons/lib/esm/generated/16px/paths';
import {
    Cog as Cog20,
    Document as Document20,
} from '@blueprintjs/icons/lib/esm/generated/20px/paths';
import { pascalCase } from 'change-case';

export function iconNameToPathsRecordKey(name) {
    return pascalCase(name);
}

export const IconSvgPaths16 = {
    Add,
    Archive,
    Blank,
    Chat,
    ChevronDown,
    ChevronRight,
    Clipboard,
    Code,
    Cog,
    Cross,
    Disable,
    Document,
    Download,
    Duplicate,
    Edit,
    Error,
    Export,
    Heart,
    Help,
    Import,
    InfoSign,
    Lightbulb,
    Play,
    Plus,
    Redo,
    Refresh,
    Share,
    Tick,
    TickCircle,
    Trash,
    Undo,
    Virus,
};

export const IconSvgPaths20 = { Cog: Cog20, Document: Document20 };
