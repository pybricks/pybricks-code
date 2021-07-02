/// <reference types="react-scripts" />

declare module '*.json' {
    const src: unknown;
    export default src;
}

declare module '*.wasm' {
    const src: string;
    export default src;
}

declare module '*.zip' {
    const src: string;
    export default src;
}

// https://webpack.js.org/api/hot-module-replacement/
interface NodeModule {
    hot?: { dispose: (callback: (data) => void) => void };
}
