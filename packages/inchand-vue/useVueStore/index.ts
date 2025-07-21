import isDeepEqual, { Store } from 'inchand';
import { onUnmounted, ref, Ref } from 'vue';

/**
 * Vue composable that selects and subscribes to a specific status in the store.
 * Trigger component re-rendering only when the value returned by the selector changes.
 *
 * @param {Store<T>} store - store instance created by createStore
 * @param {(state: T) => R} selector - function that extracts the desired value from the state.
 * @returns {Ref<R>} - reactive ref containing the state selected by selector
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
 * // In Vue component
 * const bears = useVueStore(useBearStore, state => state.bears);
 * const increasePopulation = useVueStore(useBearStore, state => state.increasePopulation);
 * ```
 */
export default function useVueStore<T, R>(store: Store<T>, selector: (state: T) => R): Ref<R> {
  // Vue reactive reference to hold the selected state
  const selectedState = ref<R>(selector(store.getState()));

  // Previous value for deep equality checking
  let previousValue = selectedState.value;

  const areValuesEqual = (a: R, b: R): boolean => {
    if (a === b) return true;

    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
      return isDeepEqual(a as object, b as object);
    }

    return false;
  };

  // Subscribe to store changes
  const unsubscribe = store.subscribe(() => {
    const newValue = selector(store.getState());

    // Only update if the selected value actually changed
    if (!areValuesEqual(previousValue, newValue)) {
      previousValue = newValue;
      selectedState.value = newValue;
    }
  });

  // Cleanup subscription when component unmounts
  onUnmounted(() => {
    unsubscribe();
  });

  return selectedState;
}
