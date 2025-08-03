import { Store } from '@inchand/createStore/type';
import isDeepEqual from '@inchand/utils/deep-equal';

/**
 * Create a Global Store with the given initial state.
 *
 * @param {T} initialState - The initial state of the store.
 * @returns A store object with the following methods:
 *              - getState: Returns the current state.
 *              - setState: Updates the state.
 *              - subscribe: Subscribes to state changes.
 *
 * @example
 * ```ts
 * const { getState, setState } = createStore({ count: 0 });
 * getState(); // { count: 0 }
 * setState({ count: 1 });
 * getState(); // { count: 1 }
 * ```
 */
export default function createStore<T>(initialState: T): Store<T> {
  let state = initialState;
  let history: T[] = [state];
  let historyIndex = 0;
  const listeners = new Set<() => void>();

  const getState = () => state;
  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;

    if (!isDeepEqual(nextState, state)) {
      state = { ...state, ...nextState };
      listeners.forEach(listener => listener());
      history.push(state);
      historyIndex++;
      historyIndex = history.length - 1;
    }
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  /**
   * Restore the state of the store to its previous value.
   *
   * @example
   * ```typescript
   * const { undo } = createStore({ count: 0 });
   * setState({ count: 1 });
   * undo();
   * getState(); // { count: 0 }
   * ```
   */
  const undo = () => {
    if (historyIndex > 0) {
      historyIndex--;
      state = history[historyIndex];
      listeners.forEach(listener => listener());
    }
  };

  /**
   * Restore the state of the store to its next value.
   *
   * @example
   * ```typescript
   * const { undo } = createStore({ count: 0 });
   * setState({ count: 1 });
   * undo();
   * redo();
   * getState(); // { count: 1 }
   * ```
   */
  const redo = () => {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      state = history[historyIndex];
      listeners.forEach(listener => listener());
    }
  };

  /**
   * Get the history index of the store.
   *
   * @example
   * ```typescript
   * const { getHistoryIndex } = createStore({ count: 0 });
   * getHistoryIndex(); // 0
   * ```
   */
  const getHistoryIndex = () => historyIndex;

  /**
   * Clear the history of the store.
   *
   * @example
   * ```typescript
   * const { clearHistory } = createStore({ count: 0 });
   * setState({ count: 1 });
   * clearHistory();
   * getState(); // { count: 0 }
   * ```
   */
  const clearHistory = () => {
    history = [state];
    historyIndex = 0;
  };

  /**
   * Ensure persistence with localstorage
   *
   * @param {string} key key value
   * @returns {void}
   *
   * @example
   * ```typescript
   * const { setState, persist, rehydrate } = createStore({ count: 0 });
   *
   * setState({ count: 5 });
   * persist('my-app');
   *
   * rehydrate('my-app');
   * ```
   */
  const persist = (key: string): void => {
    localStorage.setItem(key, JSON.stringify(state));
  };

  /**
   * Rehydrate value from localStorage
   *
   * @param {string} key key value
   * @returns {void}
   *
   * @example
   * ```typescript
   * const { setState, persist, rehydrate } = createStore({ count: 0 });
   *
   * setState({ count: 5 });
   * persist('my-app');
   *
   * rehydrate('my-app');
   * ```
   */
  const rehydrate = (key: string): void => {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = parsed;
      history.push(state);
      historyIndex = history.length - 1;
      listeners.forEach(listener => listener());
    }
  };

  /**
   * Replace All State
   *
   * @param {T} state state value
   * @returns {void}
   *
   * @example
   * ```typescript
   * const store = createStore({ count: 1, name: 'Mike' });
   * store.replaceAllState({ count: 2, name: 'Nick' });
   * ```
   */
  const replaceAllState = (newState: T): void => {
    if (!isDeepEqual(newState, state)) {
      state = newState;
      listeners.forEach(listener => listener());
      history.push(state);
      historyIndex = history.length - 1;
    }
  };

  /**
   * Restore the state to its initial state.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * const { restoreState, setState } = createStore({ count: 0 });
   *
   * setState({ count: 1 }});
   * restoreState();
   * ```
   */
  const restoreState = (): void => {
    state = initialState;
    listeners.forEach(listener => listener());
    history = [state];
    historyIndex = 0;
  };

  /**
   * Reset the state to its initial state.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * const { resetState, setState } = createStore({ count: 0 });
   *
   * setState({ count: 1 }});
   * resetState();
   * ```
   */
  const resetState = (): void => {
    restoreState();
  };

  return {
    getState,
    setState,
    subscribe,
    undo,
    redo,
    getHistoryIndex,
    clearHistory,
    persist,
    rehydrate,
    replaceAllState,
    restoreState,
    resetState,
  };
}
