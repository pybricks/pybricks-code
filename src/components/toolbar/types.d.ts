// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

import type { AriaLabelingProps, DOMProps } from '@react-types/shared';

export type ToolbarProps = {
    firstFocusableItemId: string;
};

export type AriaToolbarProps = ToolbarProps & DOMProps & AriaLabelingProps;
