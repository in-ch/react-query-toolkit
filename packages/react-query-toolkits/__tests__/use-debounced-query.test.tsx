import { describe, expect, it, vi } from 'vitest';
import React, { useState } from 'react';
import useDebouncedQuery from '@/hooks/use-debounced-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';

describe('useDebouncedQuery', () => {
  const createQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

  it('should call queryFn after debounce delay', async () => {
    const mockQueryFn = vi.fn().mockResolvedValue(['hello', 'world']);
    const key = ['test-data'];

    function Page() {
      const [input, setInput] = useState('initial');
      const { data, status } = useDebouncedQuery({
        queryKey: [...key, input],
        queryFn: mockQueryFn,
        deps: [input],
        delay: 300,
      });

      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="data">{data ? String(data) : 'loading'}</div>
          <button data-testid="update" onClick={() => setInput('changed')}>
            Change
          </button>
        </div>
      );
    }

    const client = createQueryClient();
    render(
      <QueryClientProvider client={client}>
        <Page />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('status').textContent).toBe('pending');
    expect(mockQueryFn).toHaveBeenCalledTimes(0);

    screen.getByTestId('update').click();

    expect(mockQueryFn).toHaveBeenCalledTimes(0);

    await waitFor(() => {
      expect(mockQueryFn).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('success');
      expect(screen.getByTestId('data').textContent).toBe('hello,world');
    });
  });
});
