const Environment = require('jest-environment-jsdom');

/**
 * A custom environment to set the TextEncoder
 * Thanks https://stackoverflow.com/a/57713960/1976323
 */
module.exports = class CustomTestEnvironment extends Environment {
    async setup() {
        await super.setup();
        if (typeof TextEncoder === 'undefined') {
            const { TextEncoder } = require('util');
            this.global.TextEncoder = TextEncoder;
        }
    }
};
