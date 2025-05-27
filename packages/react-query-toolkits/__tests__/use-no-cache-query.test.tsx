import { vi } from 'vitest';
import React from 'react';
import { QueryCache } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import useNoCacheQuery from '../hooks/use-no-cache-query';
import { createQueryClient, queryKey, renderWithClient } from '../utils';

describe('useNoCacheQuery', () => {
  const queryCache = new QueryCache();
  const queryClient = createQueryClient({ queryCache });

  it('should not use cache (queryFn called again after remount)', async () => {
    const mockQueryFn = vi.fn(async () => ['First']);

    const key = queryKey();

    function Page() {
      const { data } = useNoCacheQuery({
        queryKey: key,
        queryFn: mockQueryFn,
      });
      return <div data-testid="data">{data?.join(',') || 'loading'}</div>;
    }

    const rendered = renderWithClient(queryClient, <Page />);
    await waitFor(() => expect(mockQueryFn).toHaveBeenCalledTimes(1));
    expect(rendered.getByTestId('data').textContent).toBe('First');

    rendered.unmount();
    rendered.rerender(<Page />);

    await waitFor(() => expect(mockQueryFn).toHaveBeenCalledTimes(2));
    expect(rendered.getByTestId('data').textContent).toBe('First');
  });
});
