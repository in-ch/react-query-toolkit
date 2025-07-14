import { describe, expect, it } from 'vitest';
import createStore from '@inchand/createStore';

describe('createStore (clearHistory)', () => {
  it('should clear the history (1 step)', () => {
    const { setState, clearHistory, getHistoryIndex } = createStore({ count: 0 });
    setState({ count: 1 });

    clearHistory();

    expect(getHistoryIndex()).toEqual(0);
  });

  it('should clear the history (2 step)', () => {
    const { setState, clearHistory, getHistoryIndex } = createStore({ count: 0 });
    setState({ count: 1 });
    setState({ count: 2 });

    clearHistory();

    expect(getHistoryIndex()).toEqual(0);
  });

  it('should clear the history (3 step)', () => {
    const { setState, clearHistory, getHistoryIndex } = createStore({ count: 0 });
    setState({ count: 1 });
    setState({ count: 2 });
    setState({ count: 3 });

    clearHistory();

    expect(getHistoryIndex()).toEqual(0);
  });
});
