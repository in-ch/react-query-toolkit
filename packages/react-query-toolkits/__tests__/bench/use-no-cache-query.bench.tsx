import { bench, describe } from 'vitest';
import { QueryCache, useQuery } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import useNoCacheQuery from '../../hooks/use-no-cache-query';
import { createQueryClient, queryKey, renderWithClient } from '../../utils';

describe('react-query hook benchmark', () => {
  const queryCache = new QueryCache();
  const queryClient = createQueryClient({ queryCache });
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  const mockQueryFn = async () => {
    await sleep(10);
    return ['data'];
  };

  const key = queryKey();

  bench('useQuery with cache', async () => {
    function Page() {
      const { data } = useQuery({
        queryKey: key,
        queryFn: mockQueryFn,
      });
      return <div>{data}</div>;
    }
    const rendered = renderWithClient(queryClient, <Page />);
    await waitFor(() => rendered.getByText('data'));
    rendered.unmount();
  });

  bench('useNoCacheQuery (no cache)', async () => {
    function Page() {
      const { data } = useNoCacheQuery({
        queryKey: [...key, Math.random()],
        queryFn: mockQueryFn,
      });
      return <div>{data}</div>;
    }
    const rendered = renderWithClient(queryClient, <Page />);
    await waitFor(() => rendered.getByText('data'));
    rendered.unmount();
  });
});
