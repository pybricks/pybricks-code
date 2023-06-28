// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2023 The Pybricks Authors

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import 'navigator.locks';
import crypto from 'crypto';
import { inspect } from 'util';
// @ts-expect-error no typings
import matchMediaPolyfill from 'mq-polyfill';
import { config } from 'react-transition-group';

// avoid react testing library errors about not using act()
config.disabled = true;

jest.mock('./fileStorage/hooks');

//https://stackoverflow.com/a/66515427/1976323
matchMediaPolyfill(window);

// implementation of window.resizeTo for dispatching event
window.resizeTo = function resizeTo(width, height) {
    Object.assign(this, {
        innerWidth: width,
        innerHeight: height,
        outerWidth: width,
        outerHeight: height,
    }).dispatchEvent(new this.Event('resize'));
};

// scroll functions are not implemented in jsdom
// https://github.com/jsdom/jsdom/issues/1695

if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = jest.fn();
}

Object.defineProperty(global.self, 'crypto', {
    value: crypto.webcrypto,
});

// https://github.com/facebook/jest/issues/11698
function fail(reason: unknown): never {
    if (typeof reason === 'string') {
        throw new Error(reason);
    }
    throw new Error(inspect(reason));
}

if (global.fail === undefined) {
    global.fail = fail;
}
