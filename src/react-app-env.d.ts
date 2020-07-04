/// <reference types="react-scripts" />

declare module '*.json' {
    const src: object;
    export default src;
}

declare module '*.emcwasm' {
    const src: string;
    export default src;
}

declare module '*.zip' {
    const src: string;
    export default src;
}
