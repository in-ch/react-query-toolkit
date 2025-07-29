# `useAngularStore`

A **lightweight Angular-compatible wrapper** for [`inchand`](https://github.com/in-ch/react-query-toolkit/tree/main/packages/inchand) — built with RxJS to provide **reactive global state**, **selective subscription**, and **immutable updates**.

---

## ✨ Features

- ✅ Simple global state management
- 📡 Reactive state via RxJS `BehaviorSubject`
- 🎯 Fine-grained selection with `.select(key)`
- ♻️ Only emits when selected value changes (`distinctUntilChanged`)
- 🪶 Only dependencies with `inchand`
- 🧩 Easy integration in Angular components

---

## 📦 Installation

Install `inchand` and `inchand-angular`:

### npm

```bash
npm install inchand rxjs inchand-angular
```

### yarn

```bash
yarn add inchand rxjs inchand-angular
```

### pnpm

```bash
pnpm install inchand rxjs inchand-angular
```

## Usage with Angular

### 1. Define and use your store

```typescript
// useAngularStore.ts
import { createStore, deepEqual } from 'inchand';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

export default function useAngularStore<T>(initialState: T) {
  const store = createStore<T>(initialState);
  const subject$ = new BehaviorSubject<T>(store.getState());

  store.subscribe(() => {
    const next = store.getState();
    if (!deepEqual(subject$.getValue(), next)) {
      subject$.next(next);
    }
  });

  const state$ = subject$.asObservable();

  function select<K extends keyof T>(key: K) {
    return state$.pipe(
      map(state => state[key]),
      distinctUntilChanged()
    );
  }

  return {
    ...store,
    state$,
    select,
  };
}
```

### 2. Use inside an Angular component

```typescript
// counter.component.ts
import { Component } from '@angular/core';
import useAngularStore from './useAngularStore';

@Component({
  selector: 'app-counter',
  template: `
    <div *ngIf="count$ | async as count">
      <p>Count: {{ count }}</p>
      <button (click)="increment()">+</button>
    </div>
  `
})
export class CounterComponent {
  private store = useAngularStore({ count: 0 });
  count$ = this.store.select('count');

  increment() {
    this.store.setState(prev => ({ count: prev.count + 1 }));
  }
}
```

## 📘 API

```typescript
function useAngularStore<T>(initialState: T): {
  getState: () => T;
  setState: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
  state$: Observable<T>;
  select: <K extends keyof T>(key: K) => Observable<T[K]>;
};
```

| Parameter | Type                                            |                                                     Description |
| --------- | :---------------------------------------------- | --------------------------------------------------------------: |
| getState  | () => T                                         |                                       Returns the current state |
| setState  | (next: T                                        |                                   Updates the state (immutably) |
| subscribe | (listener: () => void) => () => void            |                                 Subscribes to any state changes |
| state$    | Observable<T>                                   |                                Full state as an RxJS observable |
| select    | <K extends keyof T>(key: K) => Observable<T[K]> | Selects and observes a single field; emits only when it changes |

## License

[MIT](https://github.com/in-ch/react-query-toolkit/blob/main/packages/inchand-angular/LICENSE)
