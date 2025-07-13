import { describe, expect, it } from 'vitest';
import createStore from '@inchand/createStore';

describe('createStore (redo & undo)', () => {
  it('should return previous value (1 step)', () => {
    const { getState, setState, undo } = createStore({ count: 0 });
    setState({ count: 1 });
    undo();

    expect(getState()).toEqual({ count: 0 });
  });

  it('should return previous value (2 step)', () => {
    const { getState, setState, undo } = createStore({ count: 0 });
    setState({ count: 1 });
    setState({ count: 2 });
    undo();
    undo();

    expect(getState()).toEqual({ count: 0 });
  });

  it('should return previous value (3 step)', () => {
    const { getState, setState, undo } = createStore({ count: 0 });
    setState({ count: 1 });
    setState({ count: 2 });
    setState({ count: 3 });
    setState({ count: 4 });
    undo();
    undo();
    undo();

    expect(getState()).toEqual({ count: 1 });
  });

  it('undo edge test case', () => {
    const { getState, setState, undo } = createStore({ count: 0 });
    setState({ count: 1 });
    undo();
    undo();
    undo();

    expect(getState()).toEqual({ count: 0 });
  });

  it('should return next value (1 step)', () => {
    const { getState, setState, undo, redo } = createStore({ count: 0 });
    setState({ count: 1 });
    undo();
    redo();

    expect(getState()).toEqual({ count: 1 });
  });

  it('should return next value (2 step)', () => {
    const { getState, setState, undo, redo } = createStore({ count: 0 });
    setState({ count: 1 });
    setState({ count: 2 });
    undo();
    undo();
    redo();
    redo();

    expect(getState()).toEqual({ count: 2 });
  });

  it('redo edge test case', () => {
    const { getState, setState, undo, redo } = createStore({ count: 0 });
    setState({ count: 1 });
    undo();
    redo();
    redo();

    expect(getState()).toEqual({ count: 1 });
  });
});
