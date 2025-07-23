import { describe, expect, it, vi } from 'vitest';
import { createStore } from 'inchand';
import { defineComponent, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import useVueStore from '../useVueStore';

describe('useVueStore', () => {
  it('should return the initial state', () => {
    const store = createStore<{ count: number; name: string }>({ count: 0, name: 'test' });

    const TestComponent = defineComponent({
      setup() {
        const count = useVueStore<{ count: number; name: string }, number>(store, state => state.count);
        return { count };
      },
      template: '<div data-testid="count">{{ count }}</div>',
    });

    const wrapper = mount(TestComponent);

    expect(wrapper.find('[data-testid="count"]').text()).toBe('0');
  });

  it('should update when the selected state changes', async () => {
    const store = createStore<{ count: number; name: string }>({ count: 0, name: 'test' });

    const TestComponent = defineComponent({
      setup() {
        const count = useVueStore<{ count: number; name: string }, number>(store, state => state.count);
        return { count };
      },
      template: '<div data-testid="count">{{ count }}</div>',
    });

    const wrapper = mount(TestComponent);

    store.setState({ count: 1 });
    await nextTick();

    expect(wrapper.find('[data-testid="count"]').text()).toBe('1');
  });

  it('should not re-render when unselected state changes', async () => {
    const store = createStore<{ count: number; name: string }>({ count: 0, name: 'test' });
    let renderCount = 0;

    const TestComponent = defineComponent({
      setup() {
        renderCount++;
        const count = useVueStore<{ count: number; name: string }, number>(store, state => state.count);
        return { count };
      },
      template: '<div data-testid="count">{{ count }}</div>',
    });

    const wrapper = mount(TestComponent);
    expect(renderCount).toBe(1);

    store.setState({ name: 'updated' });
    await nextTick();

    expect(renderCount).toBe(1);
    expect(wrapper.find('[data-testid="count"]').text()).toBe('0');
  });

  it('should work with multiple components subscribing to the same store', async () => {
    const store = createStore<{ count: number; name: string }>({ count: 0, name: 'test' });

    const CountComponent = defineComponent({
      setup() {
        const count = useVueStore<{ count: number; name: string }, number>(store, state => state.count);
        return { count };
      },
      template: '<div data-testid="count">{{ count }}</div>',
    });

    const NameComponent = defineComponent({
      setup() {
        const name = useVueStore<{ count: number; name: string }, string>(store, state => state.name);
        return { name };
      },
      template: '<div data-testid="name">{{ name }}</div>',
    });

    const App = defineComponent({
      components: { CountComponent, NameComponent },
      template: `
        <div>
          <CountComponent />
          <NameComponent />
        </div>
      `,
    });

    const wrapper = mount(App);

    expect(wrapper.find('[data-testid="count"]').text()).toBe('0');
    expect(wrapper.find('[data-testid="name"]').text()).toBe('test');

    store.setState({ count: 5, name: 'updated' });
    await nextTick();

    expect(wrapper.find('[data-testid="count"]').text()).toBe('5');
    expect(wrapper.find('[data-testid="name"]').text()).toBe('updated');
  });

  it('should handle function selectors that return functions', () => {
    const store = createStore<{
      increment: (value: number) => number;
      decrement: (value: number) => number;
    }>({
      increment: (value: number) => value + 1,
      decrement: (value: number) => value - 1,
    });

    const TestComponent = defineComponent({
      setup() {
        const increment = useVueStore<
          { increment: (value: number) => number; decrement: (value: number) => number },
          (value: number) => number
        >(store, state => state.increment);
        const result = increment.value(5);
        return { result };
      },
      template: '<div data-testid="result">{{ result }}</div>',
    });

    const wrapper = mount(TestComponent);

    expect(wrapper.find('[data-testid="result"]').text()).toBe('6');
  });

  it('should work with nested state selection', async () => {
    const store = createStore<{
      user: {
        profile: {
          name: string;
          settings: { theme: string };
        };
      };
    }>({
      user: {
        profile: {
          name: 'John',
          settings: { theme: 'dark' },
        },
      },
    });

    const TestComponent = defineComponent({
      setup() {
        const theme = useVueStore<{ user: { profile: { settings: { theme: string } } } }, string>(
          store,
          state => state.user.profile.settings.theme
        );
        return { theme };
      },
      template: '<div data-testid="theme">{{ theme }}</div>',
    });

    const wrapper = mount(TestComponent);

    expect(wrapper.find('[data-testid="theme"]').text()).toBe('dark');

    store.setState({
      user: {
        profile: {
          name: 'John',
          settings: { theme: 'light' },
        },
      },
    });
    await nextTick();

    expect(wrapper.find('[data-testid="theme"]').text()).toBe('light');
  });

  it('should cleanup subscription on component unmount', () => {
    const store = createStore<{ count: number }>({ count: 0 });

    // Mock the subscribe method to track subscriptions
    const originalSubscribe = store.subscribe;
    let unsubscribeCalled = false;
    store.subscribe = vi.fn(listener => {
      const unsubscribe = originalSubscribe(listener);
      return () => {
        unsubscribeCalled = true;
        unsubscribe();
      };
    });

    const TestComponent = defineComponent({
      setup() {
        const count = useVueStore<{ count: number }, number>(store, state => state.count);
        return { count };
      },
      template: '<div>{{ count }}</div>',
    });

    const wrapper = mount(TestComponent);

    expect(store.subscribe).toHaveBeenCalled();

    wrapper.unmount();

    expect(unsubscribeCalled).toBe(true);
  });
});
