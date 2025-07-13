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
}

export type { Store };
