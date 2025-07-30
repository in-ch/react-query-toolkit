import { vi } from 'vitest';

/**
 * Check expected message in console output.
 * @param {jest.SpyInstance | ReturnType<typeof vi.spyOn>} spy
 * @param {string} expectedMessage
 * @returns {boolean}
 */
export function expectConsoleDebugCalledWith(
  spy: jest.SpyInstance | ReturnType<typeof vi.spyOn>,
  expectedMessage: string
): boolean {
  const normalizedLogs = spy.mock.calls.map(call => call.join(' '));
  return normalizedLogs.some(log => log.includes(expectedMessage));
}
