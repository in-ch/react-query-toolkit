import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React, { useState } from 'react';
import useCronQuery from '@react-query-toolkits/hooks/use-cron-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { render, screen } from '@testing-library/react';

const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('useCronQuery', () => {
  const createQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

  beforeEach(() => {
    vi.useFakeTimers();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  const mockQueryFn = vi.fn();
  const queryKeyBase = ['test-data'];

  function TestPage({
    initialInput = 'initial',
    cronExpression,
    cronEnabled,
  }: {
    initialInput?: string;
    cronExpression: string;
    cronEnabled?: boolean;
  }) {
    const [input, setInput] = useState(initialInput);
    const { data, status, error } = useCronQuery<string[], Error, string[]>({
      queryKey: [...queryKeyBase, input],
      queryFn: async context => {
        return mockQueryFn(context);
      },
      cronExpression,
      cronEnabled,
    });

    return (
      <div>
        <div data-testid="status">{status}</div>
        <div data-testid="data">{data ? data.join(',') : status === 'pending' ? 'loading' : 'no data'}</div>
        <div data-testid="error">{error ? error.message : 'no error'}</div>
        <button data-testid="update-input" onClick={() => setInput('changed')}>
          Change Input
        </button>
      </div>
    );
  }

  it('should support a cron expression for every 1 minutes', async () => {
    mockQueryFn.mockResolvedValueOnce(['initial 1min']).mockResolvedValueOnce(['cron 1min - 1st']);
    const client = createQueryClient();

    render(
      <QueryClientProvider client={client}>
        <TestPage cronExpression="*/1 * * * *" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockQueryFn).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('data').textContent).toBe('initial 1min');
    });
  });
});
