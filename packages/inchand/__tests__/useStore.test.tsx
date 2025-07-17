import { describe, expect, it } from 'vitest';
import createStore from '@inchand/createStore';
import useStore from '@inchand/useStore';
import { act, render, screen } from '@testing-library/react';

describe('useStore', () => {
  it('should return the initial state', () => {
    const store = createStore({ count: 0, name: 'test' });

    const TestComponent = () => {
      const count = useStore(store, state => state.count);
      return <div data-testid="count">{count}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('should update when the selected state changes', () => {
    const store = createStore({ count: 0, name: 'test' });

    const TestComponent = () => {
      const count = useStore(store, state => state.count);
      return <div data-testid="count">{count}</div>;
    };

    render(<TestComponent />);

    act(() => {
      store.setState({ count: 1 });
    });

    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('should not re-render when unselected state changes', () => {
    const store = createStore({ count: 0, name: 'test' });
    let renderCount = 0;

    const TestComponent = () => {
      renderCount++;
      const count = useStore(store, state => state.count);
      return <div data-testid="count">{count}</div>;
    };

    render(<TestComponent />);
    expect(renderCount).toBe(1);

    act(() => {
      store.setState({ name: 'updated' });
    });

    expect(renderCount).toBe(1);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('should work with multiple components subscribing to the same store', () => {
    const store = createStore({ count: 0, name: 'test' });

    const CountComponent = () => {
      const count = useStore(store, state => state.count);
      return <div data-testid="count">{count}</div>;
    };

    const NameComponent = () => {
      const name = useStore(store, state => state.name);
      return <div data-testid="name">{name}</div>;
    };

    render(
      <div>
        <CountComponent />
        <NameComponent />
      </div>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('name')).toHaveTextContent('test');

    act(() => {
      store.setState({ count: 5, name: 'updated' });
    });

    expect(screen.getByTestId('count')).toHaveTextContent('5');
    expect(screen.getByTestId('name')).toHaveTextContent('updated');
  });

  it('should work with complex selectors', () => {
    const store = createStore({
      users: [
        { id: 1, name: 'Alice', age: 25 },
        { id: 2, name: 'Bob', age: 30 },
      ],
    });

    const TestComponent = () => {
      const userNames = useStore(store, state => state.users.map(user => user.name));
      return <div data-testid="names">{userNames.join(', ')}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByTestId('names')).toHaveTextContent('Alice, Bob');

    act(() => {
      store.setState({
        users: [
          { id: 1, name: 'Alice', age: 25 },
          { id: 2, name: 'Bob', age: 30 },
          { id: 3, name: 'Charlie', age: 35 },
        ],
      });
    });

    expect(screen.getByTestId('names')).toHaveTextContent('Alice, Bob, Charlie');
  });

  it('should not re-render when selector returns the same value', () => {
    const store = createStore({ count: 0, multiplier: 2 });
    let renderCount = 0;

    const TestComponent = () => {
      renderCount++;
      const isEven = useStore(store, state => state.count % 2 === 0);
      return <div data-testid="even">{isEven ? 'even' : 'odd'}</div>;
    };

    render(<TestComponent />);

    expect(renderCount).toBe(1);
    expect(screen.getByTestId('even')).toHaveTextContent('even');

    act(() => {
      store.setState({ count: 2 });
    });

    expect(renderCount).toBe(1);
    expect(screen.getByTestId('even')).toHaveTextContent('even');

    act(() => {
      store.setState({ count: 3 });
    });

    expect(renderCount).toBe(2);
    expect(screen.getByTestId('even')).toHaveTextContent('odd');
  });

  it('should handle function selectors that return functions', () => {
    const store = createStore({
      increment: (value: number) => value + 1,
      decrement: (value: number) => value - 1,
    });

    const TestComponent = () => {
      const increment = useStore(store, state => state.increment);
      const result = increment(5);
      return <div data-testid="result">{result}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByTestId('result')).toHaveTextContent('6');
  });

  it('should work with nested state selection', () => {
    const store = createStore({
      user: {
        profile: {
          name: 'John',
          settings: { theme: 'dark' },
        },
      },
    });

    const TestComponent = () => {
      const theme = useStore(store, state => state.user.profile.settings.theme);
      return <div data-testid="theme">{theme}</div>;
    };

    render(<TestComponent />);

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    act(() => {
      store.setState({
        user: {
          profile: {
            name: 'John',
            settings: { theme: 'light' },
          },
        },
      });
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
  });
});
