import { describe, expect, it } from 'vitest';
import createStore from '@inchand/createStore';

describe('createStore (replaceAllState)', () => {
  it('should replace state to new state.', () => {
    const { getState, replaceAllState } = createStore({ count: 1, name: 'Mike' });
    replaceAllState({ count: 2, name: 'Nick' });

    expect(getState()).toEqual({ count: 2, name: 'Nick' });
  });

  it('should previous value must be completely overwritten.', () => {
    const { getState, replaceAllState } = createStore({ count: 1, name: 'Mike' });
    replaceAllState({ count: 2 });
    expect(getState()).toEqual({ count: 2 });
  });
});
