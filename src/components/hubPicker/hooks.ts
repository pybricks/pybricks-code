// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { useLocalStorage } from 'usehooks-ts';
import { Hub } from '.';

/**
 * Hook for {@link HubPicker} state backed by local storage.
 * @returns Tuple of the current state and setter (like useState()).
 */
export function useHubPickerSelectedHub() {
    return useLocalStorage('hubPicker.selectedHub', Hub.Move);
}
