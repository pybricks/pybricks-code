// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors
//
// Explorer translation keys.

import { I18n, useI18n as useShopifyI18n } from '@shopify/react-i18n';

export function useI18n(): I18n {
    // istanbul ignore next: babel-loader rewrites this line
    const [i18n] = useShopifyI18n();
    return i18n;
}

export enum I18nId {
    HeaderToolbarAddNew = 'header.toolbar.addNew',
    HeaderToolbarExportAll = 'header.toolbar.exportAll',
    HeaderToolbarImport = 'header.toolbar.import',
    HeaderToolbarTitle = 'header.toolbar.title',
    TreeItemDeleteTooltip = 'treeItem.deleteTooltip',
    TreeItemDuplicateTooltip = 'treeItem.duplicateTooltip',
    TreeItemExportTooltip = 'treeItem.exportTooltip',
    TreeItemRenameTooltip = 'treeItem.renameTooltip',
    TreeLabel = 'tree.label',
    TreeLiveDescriptorIntroAccessibilityGuide = 'tree.liveDescriptor.intro.accessibilityGuide',
    TreeLiveDescriptorIntroKeybindingsDelete = 'tree.liveDescriptor.intro.keybindings.delete',
    TreeLiveDescriptorIntroKeybindingsDuplicate = 'tree.liveDescriptor.intro.keybindings.duplicate',
    TreeLiveDescriptorIntroKeybindingsExport = 'tree.liveDescriptor.intro.keybindings.export',
    TreeLiveDescriptorIntroKeybindingsPrimaryAction = 'tree.liveDescriptor.intro.keybindings.primaryAction',
    TreeLiveDescriptorIntroKeybindingsRename = 'tree.liveDescriptor.intro.keybindings.rename',
    TreeLiveDescriptorIntroNavigation = 'tree.liveDescriptor.intro.navigation',
    TreeLiveDescriptorSearching = 'tree.liveDescriptor.searching',
}
