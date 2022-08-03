// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

// exposes some monaco editor internal functions

import {} from 'react-aria';

declare module 'react-aria' {
    export interface OverlayContainerProps {
        // work around https://github.com/adobe/react-spectrum/issues/3375
        className: string;
    }
}
