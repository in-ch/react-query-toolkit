import { describe, expect, it, vi } from 'vitest';
import createStore from '@inchand/createStore';
import useStore from '@inchand/useStore';
import { expectConsoleDebugCalledWith } from '@inchand/utils/expectConsoleDebugCalledWith';
import { act, render } from '@testing-library/react';

describe('debug', () => {
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
  });

  it('should console debug label (initialized)', () => {
    const store = createStore({ count: 0, name: 'test' });
    const TestComponent = () => {
      const count = useStore(store, state => state.count, { debugMode: true });
      return <div data-testid="count">{count}</div>;
    };

    render(<TestComponent />);

    act(() => {
      store.setState({ count: 1 });
    });

    expect(expectConsoleDebugCalledWith(consoleDebugSpy, '[useStore] initialized: 0')).toBe(true);
    consoleDebugSpy.mockRestore();
  });

  it('should console debug label (update)', () => {
    const store = createStore({ count: 0, name: 'test' });
    const TestComponent = () => {
      const count = useStore(store, state => state.count, { debugMode: true });
      return <div data-testid="count">{count}</div>;
    };

    render(<TestComponent />);

    act(() => {
      store.setState({ count: 1 });
    });

    expect(expectConsoleDebugCalledWith(consoleDebugSpy, '[useStore] prev value: 0')).toBe(true);
    expect(expectConsoleDebugCalledWith(consoleDebugSpy, '[useStore] next value: 1')).toBe(true);
    consoleDebugSpy.mockRestore();
  });
});
