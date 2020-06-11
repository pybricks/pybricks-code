const Environment = require('jest-environment-jsdom');
const { TextEncoder, TextDecoder } = require('util')

/**
 * A custom environment to set TextEncoder/TextDecoder
 * Thanks https://stackoverflow.com/a/57713960/1976323
 */
module.exports = class CustomTestEnvironment extends Environment {
    async setup() {
        await super.setup();
        if (this.global.TextEncoder === undefined) {
            this.global.TextEncoder = TextEncoder;
        }
        if (this.global.TextDecoder === undefined) {
            this.global.TextDecoder = TextDecoder;
        }
    }
};
