import { describe, expect, it, vi } from 'vitest';
import createStore from '@inchand/createStore';

describe('createStore (restoreState)', () => {
  it('should restore its initial state. 1 depths', () => {
    const { getState, setState, restoreState } = createStore({ count: 1 });
    setState({ count: 2 });
    restoreState();

    expect(getState()).toEqual({ count: 1 });
  });

  it('should restore its initial state. 2 depths', () => {
    const { getState, setState, restoreState } = createStore({ count: 1 });
    setState({ count: 2 });
    setState({ count: 3 });
    restoreState();

    expect(getState()).toEqual({ count: 1 });
  });

  it('should allow state update after restoring', () => {
    const { getState, setState, restoreState } = createStore({ count: 1 });
    setState({ count: 10 });
    restoreState();
    setState({ count: 99 });
    expect(getState()).toEqual({ count: 99 });
  });

  it('should call listeners after restoring', () => {
    const { restoreState, subscribe } = createStore({ count: 1 });
    const listener = vi.fn();
    subscribe(listener);
    restoreState();
    expect(listener).toHaveBeenCalled();
  });

  it('should reset historyIndex after restoring', () => {
    const { getHistoryIndex, setState, restoreState } = createStore({ count: 1 });
    setState({ count: 2 });
    setState({ count: 3 });
    expect(getHistoryIndex()).toBe(2);
    restoreState();
    expect(getHistoryIndex()).toBe(0);
  });
});
