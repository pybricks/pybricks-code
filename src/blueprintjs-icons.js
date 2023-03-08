// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

// HACK: Prevent webpack from picking up all icons.
// https://github.com/palantir/blueprint/issues/2193

// istanbul ignore file

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
    Manual,
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
    WarningSign,
} from '@blueprintjs/icons/lib/esm/generated-icons/16px/paths';
import {
    Cog as Cog20,
    Document as Document20,
    Error as Error20,
    InfoSign as InfoSign20,
    Manual as Manual20,
    Trash as Trash20,
    WarningSign as WarningSign20,
} from '@blueprintjs/icons/lib/esm/generated-icons/20px/paths';
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
    Manual,
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
    WarningSign,
};

export const IconSvgPaths20 = {
    Cog: Cog20,
    Document: Document20,
    Error: Error20,
    InfoSign: InfoSign20,
    Manual: Manual20,
    Trash: Trash20,
    WarningSign: WarningSign20,
};
