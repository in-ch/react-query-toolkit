# inchand

A **lightweight, framework-agnostic global store** with **undo/redo history**, **persistence**, and **React integration**

---

## Features

- ✅ Simple global state management
- 🔁 Undo / Redo state changes
- 💾 LocalStorage persistence & hydration
- ⚛️ React support via `useStore` hook (selective re-rendering)
- 📦 Framework-agnostic core store logic
- 🪶 Zero dependencies

---

## Installation

### npm

```bash
npm install inchand
```

### yarn

```bash
yarn inchand
```

### pnpm

```bash
pnpm install inchand
```

---

## Usage

### 1. createStore

```typescript
const { getState, setState } = createStore({ count: 0 });
getState(); // { count: 0 }
setState({ count: 1 });
getState(); // { count: 1 }
```

## With React

```typescript
export const useBearStore = createStore<BearState>((set, get) => ({
         bears: 0,
         honey: 100,
         increasePopulation: () => set(state => ({ bears: state.bears + 1 })),
         eatHoney: () => set(state => ({ honey: state.honey - 10 })),
}));
 *
const bears = useStore(useBearStore, state => state.bears);
const increasePopulation = useStore(useBearStore, state => state.increasePopulation);
```

## Undo / Redo

```typescript
counterStore.setState({ count: 5 });
counterStore.undo();
counterStore.redo();
```

## Persistence

```typescript
counterStore.setState({ count: 10 });
counterStore.persist('my-app-key');

counterStore.rehydrate('my-app-key');
```

## License

[MIT](https://github.com/in-ch/react-query-toolkit/blob/main/packages/inchand/LICENSE)
