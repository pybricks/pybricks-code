// SPDX-License-Identifier: MIT
// Copyright (c) 2022-2023 The Pybricks Authors

import { useLocalStorage } from 'usehooks-ts';
import { ProgramType } from '.';

/**
 * Hook for {@link ProgramTypePicker} state backed by local storage.
 * @returns Tuple of the current state and setter (like useState()).
 */
export function useProgramTypePickerSelectedProgramType() {
    return useLocalStorage('programTypePicker.selectedProgramType', ProgramType.Python);
}
