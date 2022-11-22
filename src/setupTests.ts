// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2022 The Pybricks Authors

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import 'navigator.locks';
import crypto from 'crypto';
import { inspect } from 'util';
import {
    KeyCodes,
    Modifiers,
} from '@blueprintjs/core/lib/cjs/components/hotkeys/hotkeyParser';
// @ts-expect-error no typings
import matchMediaPolyfill from 'mq-polyfill';

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

// HACK: work around https://github.com/palantir/blueprint/issues/4165
// userEvent.keyboard does not set which, so we have to do a reverse lookup
// using the blueprintjs keymap.

// handle cases that are not simple lower case conversion
const specialCases: Record<string, string> = {
    Control: 'ctrl',
    ' ': 'space',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    Delete: 'del',
    Insert: 'ins',
    Escape: 'esc',
};

function addWhichToKeyboardEvent(e: KeyboardEvent) {
    // blueprints and testing-library both don't do this one
    if (e.key === 'ContextMenu') {
        // HACK: work around lack of ContextMenu key support in user-events
        if (e.target !== null) {
            e.target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
        }
        return;
    }

    const blueprintsKeyName = specialCases[e.key] ?? e.key.toLowerCase();
    let which = 0;

    for (const [k, v] of Object.entries(KeyCodes).concat(Object.entries(Modifiers))) {
        if (v === blueprintsKeyName) {
            which = Number(k);
            break;
        }
    }

    if (which === 0) {
        console.warn('unsupported key:', e.key, e.code);
    }

    Object.defineProperty(e, 'which', { value: which });
}

document.addEventListener('keydown', addWhichToKeyboardEvent, { capture: true });
document.addEventListener('keypress', addWhichToKeyboardEvent, { capture: true });
document.addEventListener('keyup', addWhichToKeyboardEvent, { capture: true });

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
