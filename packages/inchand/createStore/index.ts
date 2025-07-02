import type { Store } from '@inchand/createStore/type';

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
 * store.getState(); // { count: 0 }
 * store.setState({ count: 1 });
 * store.getState(); // { count: 1 }
 * ```
 */
export default function createStore<T>(initialState: T): Store<T> {
  let state = initialState;
  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    if (nextState !== state) {
      state = { ...state, ...nextState };
      listeners.forEach(listener => listener());
    }
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
}
