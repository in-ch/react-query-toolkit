import { describe, expect, it, vi } from 'vitest';
import createStore from '@inchand/createStore';

describe('persist & rehydrate', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should persist the current state to localStorage', () => {
    const store = createStore({ count: 0 });
    store.setState({ count: 5 });

    store.persist('my-key');

    const saved = localStorage.getItem('my-key');
    expect(saved).toBe(JSON.stringify({ count: 5 }));
  });

  it('should rehydrate the state from localStorage', () => {
    const store = createStore({ count: 0 });
    localStorage.setItem('my-key', JSON.stringify({ count: 10 }));
    store.rehydrate('my-key');

    expect(store.getState()).toEqual({ count: 10 });
  });

  it('should notify listeners on rehydrate', () => {
    const store = createStore({ count: 0 });

    const listener = vi.fn();
    store.subscribe(listener);

    localStorage.setItem('my-key', JSON.stringify({ count: 3 }));
    store.rehydrate('my-key');

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
