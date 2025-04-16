import { describe, expect, it, vi } from 'vitest';
import React from 'react';
import { QueryCache } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { useSchedule } from '../index';
import { createQueryClient, queryKey, renderWithClient, sleep } from '../utils';

describe('useSchedule', () => {
  const queryCache = new QueryCache();
  const queryClient = createQueryClient({
    queryCache,
  });

  it('should allow to set default data value', async () => {
    const key = queryKey();
    function Page() {
      const { data = 'default' } = useSchedule({
        queryKey: key,
        queryFn: async () => {
          await sleep(10);
          return 'test';
        },
      });
      return (
        <div>
          <h1>{data}</h1>
        </div>
      );
    }
    const rendered = renderWithClient(queryClient, <Page />);
    rendered.getByText('default');
    await waitFor(async () => rendered.getByText('test'));
  });

  it('fetches data with delay', async () => {
    const mockQueryFn = vi.fn(async () => 'delayed data');
    const key = queryKey();
    function Page() {
      const { data, status } = useSchedule({
        queryKey: key,
        queryFn: mockQueryFn,
        delay: 100,
      });
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="data">{data || 'loading'}</div>
        </div>
      );
    }
    const rendered = renderWithClient(queryClient, <Page />);
    expect(rendered.getByTestId('status').textContent).toBe('pending');
    expect(rendered.getByTestId('data').textContent).toBe('loading');
    expect(mockQueryFn).not.toHaveBeenCalled();
    await waitFor(() => expect(mockQueryFn).toHaveBeenCalledTimes(1));
    expect(rendered.getByTestId('status').textContent).toBe('success');
    expect(rendered.getByTestId('data').textContent).toBe('delayed data');
  });

  it('refetches on schedule (every second)', async () => {
    const mockQueryFn = vi.fn(async () => 'delayed data');
    const key = queryKey();
    function Page() {
      const { data, status } = useSchedule({
        queryKey: key,
        queryFn: mockQueryFn,
        delay: 1000,
        interval: 1000,
      });
      return (
        <div>
          <div data-testid="status-refetches">{status}</div>
          <div data-testid="data-refetches">{data || 'loading'}</div>
        </div>
      );
    }
    const rendered = renderWithClient(queryClient, <Page />);

    expect(rendered.getByTestId('status-refetches').textContent).toBe('pending');
    expect(rendered.getByTestId('data-refetches').textContent).toBe('loading');
    expect(mockQueryFn).not.toHaveBeenCalled();

    await waitFor(() => expect(mockQueryFn).toHaveBeenCalledTimes(0), { timeout: 1001 });
    await waitFor(() => expect(mockQueryFn).toHaveBeenCalledTimes(1), { timeout: 2001 });
    await waitFor(() => expect(mockQueryFn).toHaveBeenCalledTimes(1), { timeout: 2999 });
    await waitFor(() => expect(mockQueryFn).toHaveBeenCalledTimes(2), { timeout: 3000 });

    expect(rendered.getByTestId('status-refetches').textContent).toBe('success');
    expect(rendered.getByTestId('data-refetches').textContent).toBe('delayed data');
  });

  it('handles query errors', async () => {
    const mockQueryFn = vi.fn(async () => {
      throw new Error('fetch error');
    });
    const key = queryKey();
    function Page() {
      const { status, error } = useSchedule<unknown, Error>({
        queryKey: key,
        queryFn: mockQueryFn,
        delay: 50,
        retry: 0,
      });
      return (
        <div>
          <div data-testid="status-handle-error">{status}</div>
          <div data-testid="error-handle-error">{error?.message || 'no error'}</div>
        </div>
      );
    }
    const rendered = renderWithClient(queryClient, <Page />);

    await waitFor(
      () => {
        expect(rendered.getByTestId('status-handle-error').textContent).toBe('error');
        expect(rendered.getByTestId('error-handle-error').textContent).toBe('fetch error');
        expect(mockQueryFn).toHaveBeenCalledTimes(1);
      },
      { timeout: 1000 }
    );
  });
});
