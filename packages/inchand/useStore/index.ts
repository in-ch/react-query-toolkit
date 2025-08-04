import { useRef, useSyncExternalStore } from 'react';
import { Store, UseStoreOptions } from '@inchand/createStore/type';
import isDeepEqual from '@inchand/utils/deep-equal';
import { logStateChange } from '@inchand/utils/log';

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
export default function useStore<T, R>(store: Store<T>, selector: (state: T) => R, options?: UseStoreOptions): R {
  const previousValueRef = useRef<R>();
  const hasInitializedRef = useRef(false);

  const areValuesEqual = (a: R, b: R): boolean => {
    if (a === b) return true;

    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      return isDeepEqual(a as object, b as object);
    }

    return false;
  };

  const getSnapshot = () => {
    const newValue = selector(store.getState());

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      previousValueRef.current = newValue;
      logStateChange('initialized', `${newValue}`, options);

      return newValue;
    }

    if (!areValuesEqual(previousValueRef.current as R, newValue)) {
      logStateChange('changed', `${previousValueRef.current} -> ${newValue}`, options);
      previousValueRef.current = newValue;
      return newValue;
    }

    return previousValueRef.current;
  };

  const state = useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);

  return state;
}
