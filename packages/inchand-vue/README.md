# `useVueStore`

A **Vue composable** — a lightweight, framework-agnostic global store, and **Vue** integration.

---

## ✨ Features

- ✅ Subscribe to global state with selector
- 🎯 Fine-grained reactivity (deep equality check)
- 🔁 Triggers updates **only when selected state changes**
- 🧼 Auto unsubscribe on unmount
- 🧩 Fully compatible with `inchand` store
- 🪶 Only dependencies with `inchand`

---

## 📦 Installation

Install the `inchand` core store & `inchand-vue` package:

### npm

```bash
npm install inchand inchand-vue
```

### yarn

```bash
yarn add inchand inchand-vue
```

### pnpm

```bash
pnpm install inchand inchand-vue
```

## Usage with Vue

### Create your store

```typescript
import { createStore } from 'inchand';

type BearState = {
  bears: number;
  honey: number;
  increasePopulation: () => void;
  eatHoney: () => void;
};

export const useBearStore = createStore<BearState>((set, get) => ({
  bears: 0,
  honey: 100,
  increasePopulation: () => set(state => ({ bears: state.bears + 1 })),
  eatHoney: () => set(state => ({ honey: state.honey - 10 })),
}));
```

### Use inside a Vue component

```ts
<script setup lang="ts">
import { useBearStore } from './store';
import useVueStore from './useVueStore';

const bears = useVueStore(useBearStore, state => state.bears);
const increase = useVueStore(useBearStore, state => state.increasePopulation);
</script>

<template>
  <div>
    <p>Bears: {{ bears }}</p>
    <button @click="increase()">Add Bear</button>
  </div>
</template>
```

## 📘 API

```typescript
function useVueStore<T, R>(store: Store<T>, selector: (state: T) => R): Ref<R>;
```

| Parameter | Type            |                                       Description |
| --------- | :-------------- | ------------------------------------------------: |
| store     | Store<T>        |                        The inchand store instance |
| selector  | (state: T) => R | Function to extract a specific slice of the state |
| returns   | Ref<R>          |               Vue ref bound to the selected value |

## License

[MIT](https://github.com/in-ch/react-query-toolkit/blob/main/packages/inchand-vue/LICENSE)
