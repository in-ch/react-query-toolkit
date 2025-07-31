import { UseStoreOptions } from '@inchand/createStore/type';

type LogLevel = 'log' | 'debug' | 'error';

/**
 * Console message according to log level
 *
 * @param {'log' | 'debug' | 'error'} level log level
 * @param {UseStoreOptions} options useStore options
 * @param {unknown} args rest arguments
 * @returns {void}
 */
const log = (level: LogLevel, options: UseStoreOptions | undefined, ...args: unknown[]) => {
  switch (level) {
    case 'log':
      options?.consoleMode && console.log(...args);
      break;
    case 'debug':
      options?.debugMode && console.debug(...args);
      break;
    case 'error':
      options?.errorMode && console.error(...args);
      break;
  }
};

/**
 * Attach label
 *
 * @param {string} label label message
 * @param {R | undefined} prev prev state
 * @param {R} next next state
 * @returns {void}
 */
const logStateChange = <R>(label: string, prev: R | undefined, next: R, options: UseStoreOptions | undefined) => {
  (['log', 'debug', 'error'] as LogLevel[]).forEach(level => {
    log(level, options, `[useStore] ${label}:`, level === 'log' ? next : prev, next);
  });
};

export { log, logStateChange };
export type { LogLevel };
