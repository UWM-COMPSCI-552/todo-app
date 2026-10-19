/* global jest, global, window */

// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

if (typeof structuredClone === 'undefined') {
    global.structuredClone = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };
}

if (typeof window.matchMedia === 'undefined') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
}
