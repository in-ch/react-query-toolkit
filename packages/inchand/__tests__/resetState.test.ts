import { describe, expect, it, vi } from 'vitest';
import createStore from '@inchand/createStore';

describe('createStore (resetState)', () => {
  it('should restore its initial state. 1 depths', () => {
    const { getState, setState, resetState } = createStore({ count: 1 });
    setState({ count: 2 });
    resetState();

    expect(getState()).toEqual({ count: 1 });
  });

  it('should restore its initial state. 2 depths', () => {
    const { getState, setState, resetState } = createStore({ count: 1 });
    setState({ count: 2 });
    setState({ count: 3 });
    resetState();

    expect(getState()).toEqual({ count: 1 });
  });

  it('should allow state update after restoring', () => {
    const { getState, setState, resetState } = createStore({ count: 1 });
    setState({ count: 10 });
    resetState();
    setState({ count: 99 });
    expect(getState()).toEqual({ count: 99 });
  });

  it('should call listeners after restoring', () => {
    const { resetState, subscribe } = createStore({ count: 1 });
    const listener = vi.fn();
    subscribe(listener);
    resetState();
    expect(listener).toHaveBeenCalled();
  });

  it('should reset historyIndex after restoring', () => {
    const { getHistoryIndex, setState, resetState } = createStore({ count: 1 });
    setState({ count: 2 });
    setState({ count: 3 });
    expect(getHistoryIndex()).toBe(2);
    resetState();
    expect(getHistoryIndex()).toBe(0);
  });
});
