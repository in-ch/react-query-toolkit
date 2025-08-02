interface Store<T> {
  /**
   * Returns the current state.
   */
  getState: () => T;
  /**
   * Updates the state.
   */
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  /**
   * Subscribes to state changes.
   */
  subscribe: (listener: () => void) => () => void;
  /**
   *  Restore the state of the store to its previous value.
   */
  undo: () => void;
  /**
   * Restore the state of the store to its next value.
   */
  redo: () => void;
  /**
   * Get the history index of the store.
   */
  getHistoryIndex: () => number;
  /**
   * Clear the history of the store.
   */
  clearHistory: () => void;
  /**
   * Ensure persistence with localstorage
   */
  persist: (key: string) => void;
  /**
   * Rehydrate value from localStorage
   */
  rehydrate: (key: string) => void;
  /**
   * Replace All State
   */
  replaceAllState: (newState: T) => void;
}

interface UseStoreOptions {
  /**
   * Console Debug log when this value is `true`
   */
  debugMode?: boolean;

  /**
   * Console log when this value is `true`
   */
  consoleMode?: boolean;

  /**
   * Console error when this value is `true`
   */
  errorMode?: boolean;
}

export type { Store, UseStoreOptions };
