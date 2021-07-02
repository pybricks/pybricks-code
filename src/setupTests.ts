// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
// @ts-expect-error no typings
import matchMediaPolyfill from 'mq-polyfill';

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
