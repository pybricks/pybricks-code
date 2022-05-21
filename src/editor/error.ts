// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import { CustomError } from '../utils/customError';

/** Specific errors for editor subsystem. */
export type EditorErrorName = 'FileInUse';

/** Error class for editor subsystem. */
export class EditorError extends CustomError<EditorErrorName> {}
