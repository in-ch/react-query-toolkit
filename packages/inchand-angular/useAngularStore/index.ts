import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { deepEqual, createStore } from 'inchand';

/**
 * Creates an Angular-friendly global store with reactive bindings.
 *
 * This utility wraps the base `createStore` and exposes an RxJS-based
 * reactive state stream (`state$`) as well as a `select` function to
 * subscribe to specific keys in the state.
 *
 * @template T The type of the store's state.
 * @param {T} initialState The initial state of the store.
 * @returns An object that includes all base store methods,
 *          along with `state$` and `select` for Angular compatibility.
 * @example
 * ```tsx
 * import { Component } from '@angular/core';
 * import { useAngularStore } from './useAngularStore';
 * 
 * @Component({
 *   selector: 'app-counter',
 *   template: `
 *     <div *ngIf="count$ | async as count">
 *       Count: {{ count }}
 *       <button (click)="increment()">+</button>
 *     </div>
 *   `
 * })
 * 
 * export class CounterComponent {
 *   private store = useAngularStore({ count: 0 });
 *   count$ = this.store.select('count');
 * 
 *   increment() {
 *     this.store.setState(prev => ({ count: prev.count + 1 }));
 *   }
 * }
 * ```
 */
export default function useAngularStore<T>(initialState: T) {
  const store = createStore<T>(initialState);
  const subject$ = new BehaviorSubject<T>(store.getState());

  /**
   * Whenever the internal state changes, emit the new state through the RxJS stream
   */
  store.subscribe(() => {
    const next = store.getState();
    if (!deepEqual(subject$.getValue(), next)) {
      subject$.next(next);
    }
  });

  const state$ = subject$.asObservable();

  /**
   * Select a specific key from the state as an observable.
   *
   * @template K The key of the state to select.
   * @param {K} key The key to observe.
   * @returns An observable that emits the value of the specified key,
   *          and only when it changes.
   */
  function select<K extends keyof T>(key: K) {
    return state$.pipe(
      map(state => state[key]),
      distinctUntilChanged()
    );
  }

  return {
    ...store,
    state$,
    select
  };
}
