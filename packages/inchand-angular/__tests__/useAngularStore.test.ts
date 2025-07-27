import { describe, expect, it } from 'vitest';
import useAngularStore from '../useAngularStore';

describe('useAngularStore', () => {
  it('should return the initial state', () => {
    const store = useAngularStore({ count: 0, name: 'test' });
    expect(store.getState()).toEqual({ count: 0, name: 'test' });
  });

  it('should emit new state on state$ when updated', async () => {
    const store = useAngularStore({ count: 0 });

    const emitted: any[] = [];
    const sub = store.state$.subscribe(value => emitted.push(value));

    store.setState({ count: 1 });

    expect(emitted).toEqual([{ count: 0 }, { count: 1 }]);

    sub.unsubscribe();
  });

  it('should only emit distinct values on select', () => {
    const store = useAngularStore({ count: 0 });

    const emitted: number[] = [];
    const sub = store.select('count').subscribe(value => emitted.push(value));

    store.setState({ count: 0 });
    store.setState({ count: 1 });
    store.setState({ count: 1 });
    store.setState({ count: 2 });

    expect(emitted).toEqual([0, 1, 2]);

    sub.unsubscribe();
  });

  it('should support multiple subscriptions', () => {
    const store = useAngularStore({ count: 0 });

    const emitted1: number[] = [];
    const emitted2: number[] = [];

    const sub1 = store.select('count').subscribe(val => emitted1.push(val));
    const sub2 = store.select('count').subscribe(val => emitted2.push(val));

    store.setState({ count: 1 });

    expect(emitted1).toEqual([0, 1]);
    expect(emitted2).toEqual([0, 1]);

    sub1.unsubscribe();
    sub2.unsubscribe();
  });

  it('should support updating via functional updater', () => {
    const store = useAngularStore({ count: 0 });

    store.setState(prev => ({ count: prev.count + 10 }));
    expect(store.getState()).toEqual({ count: 10 });
  });

  it('should not emit when deepEqual returns true', () => {
    const store = useAngularStore({ nested: { value: 1 } });

    const emitted: any[] = [];
    const sub = store.state$.subscribe(v => emitted.push(v));

    store.setState({ nested: { value: 1 } });
    store.setState({ nested: { value: 2 } });
    expect(emitted.length).toBe(2);
    expect(emitted[0]).toEqual({ nested: { value: 1 } });
    expect(emitted[1]).toEqual({ nested: { value: 2 } });

    sub.unsubscribe();
  });
});
