import { describe, expect, it, vi } from 'vitest';
import createStore from '@inchand/createStore';

describe('createStore', () => {
  it('should initialize with the given state', () => {
    const { getState } = createStore({ count: 0 });
    expect(getState()).toEqual({ count: 0 });
  });

  it('should update the state using setState', () => {
    const { getState, setState } = createStore({ count: 0 });
    setState({ count: 1 });
    expect(getState()).toEqual({ count: 1 });
  });

  it('should merge the state when using setState with a partial state', () => {
    const { getState, setState } = createStore({ count: 0, name: 'Alice' });
    setState({ count: 1 });
    expect(getState()).toEqual({ count: 1, name: 'Alice' });
  });

  it('should update the state with a function passed to setState', () => {
    const { getState, setState } = createStore({ count: 0 });
    setState(prevState => ({ count: prevState.count + 1 }));
    expect(getState()).toEqual({ count: 1 });
  });

  it('should trigger listeners when state changes', () => {
    const { setState, subscribe } = createStore({ count: 0 });
    const listener = vi.fn();

    const unsubscribe = subscribe(listener);

    setState({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);

    setState({ count: 2 });
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    setState({ count: 3 });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('should not trigger listeners if the state does not change', () => {
    const { setState, subscribe } = createStore({ count: 0 });
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    setState({ count: 0 });
    expect(listener).not.toHaveBeenCalled();

    unsubscribe();
  });

  it('should work with complex state updates', () => {
    const { getState, setState } = createStore({ count: 0, items: ['item1'] });
    setState(prevState => ({
      count: prevState.count + 1,
      items: [...prevState.items, 'item2'],
    }));
    expect(getState()).toEqual({ count: 1, items: ['item1', 'item2'] });
  });
});
