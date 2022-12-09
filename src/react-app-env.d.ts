// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

/// <reference types="node" />
/// <reference types="react-dom" />
/// <reference types="user-agent-data-types" />

declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test';
        readonly PUBLIC_URL: string;
    }
}

declare module '*.avif' {
    const src: string;
    export default src;
}

declare module '*.bmp' {
    const src: string;
    export default src;
}

declare module '*.gif' {
    const src: string;
    export default src;
}

declare module '*.jpg' {
    const src: string;
    export default src;
}

declare module '*.jpeg' {
    const src: string;
    export default src;
}

declare module '*.png' {
    const src: string;
    export default src;
}

declare module '*.webp' {
    const src: string;
    export default src;
}

declare module '*.svg' {
    import * as React from 'react';

    export const ReactComponent: React.FunctionComponent<
        React.SVGProps<SVGSVGElement> & { title?: string }
    >;

    const src: string;
    export default src;
}

declare module '*.module.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.scss' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.sass' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.json' {
    const src: unknown;
    export default src;
}

declare module '*.zip' {
    const src: string;
    export default src;
}

declare module '*.mp4' {
    const src: string;
    export default src;
}

declare module '*.vtt' {
    const src: string;
    export default src;
}
// https://webpack.js.org/api/hot-module-replacement/
interface NodeModule {
    hot?: { dispose: (callback: (data) => void) => void };
}
