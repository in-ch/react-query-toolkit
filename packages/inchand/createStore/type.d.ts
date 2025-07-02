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
}

export type { Store };
