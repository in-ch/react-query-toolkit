import { useSyncExternalStore } from 'react';
import { Store } from '@inchand/createStore/type';

/**
 * React hooks that select and subscribe to a specific status in the store.
 * Trigger component re-rendering only when the value returned by the selector changes.
 *
 * @param {Store<T>} store - store instance created by createStore
 * @param {(state: T) => R} selector - function that extracts the desired value from the state.
 * @returns {R} - state selected by selector
 *
 * @example
 * ```typescript
 * export const useBearStore = createStore<BearState>((set, get) => ({
 *          bears: 0,
 *          honey: 100,
 *          increasePopulation: () => set(state => ({ bears: state.bears + 1 })),
 *          eatHoney: () => set(state => ({ honey: state.honey - 10 })),
 * }));
 *
 * const bears = useStore(useBearStore, state => state.bears);
 * const increasePopulation = useStore(useBearStore, state => state.increasePopulation);
 * ```
 */
export default function useStore<T, R>(store: Store<T>, selector: (state: T) => R): R {
  const state = useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState())
  );

  return state;
}
