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
    HeaderToolbarTitle = 'header.toolbar.title',
    HeaderToolbarExportAll = 'header.toolbar.exportAll',
    HeaderToolbarImport = 'header.toolbar.import',
    HeaderToolbarAddNew = 'header.toolbar.addNew',
    TreeLabel = 'tree.label',
    TreeLiveDescriptorIntroAccessibilityGuide = 'tree.liveDescriptor.intro.accessibilityGuide',
    TreeLiveDescriptorIntroNavigation = 'tree.liveDescriptor.intro.navigation',
    TreeLiveDescriptorIntroKeybindingsPrimaryAction = 'tree.liveDescriptor.intro.keybindings.primaryAction',
    TreeLiveDescriptorIntroKeybindingsDuplicate = 'tree.liveDescriptor.intro.keybindings.duplicate',
    TreeLiveDescriptorIntroKeybindingsExport = 'tree.liveDescriptor.intro.keybindings.export',
    TreeLiveDescriptorIntroKeybindingsDelete = 'tree.liveDescriptor.intro.keybindings.delete',
    TreeLiveDescriptorSearching = 'tree.liveDescriptor.searching',
    TreeItemDeleteTooltip = 'treeItem.deleteTooltip',
    TreeItemExportTooltip = 'treeItem.exportTooltip',
    TreeItemDuplicateTooltip = 'treeItem.duplicateTooltip',
}
