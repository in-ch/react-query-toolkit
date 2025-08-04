import { MockInstance } from 'vitest';

/**
 * Test spy on console log
 *
 * @param {MockInstance<(this: unknown, ...args: unknown[]) => unknown>} spy spy
 * @returns {void}
 */
export default function testSpyOnConsoleLog(spy: MockInstance<(this: unknown, ...args: unknown[]) => unknown>) {
  spy.mock.calls.forEach(call => {
    console.log(...call);
  });
}
