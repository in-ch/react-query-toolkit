import { describe, it } from 'vitest';
import React from 'react';
import { QueryCache, useQuery } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { createQueryClient, queryKey, renderWithClient, sleep } from '../utils';

describe('usePrefetchInfiniteQuery', () => {
  const queryCache = new QueryCache();
  const queryClient = createQueryClient({
    queryCache,
  });
  it('should allow to set default data value', async () => {
    const key = queryKey();

    function Page() {
      const { data = 'default' } = useQuery({
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

    await waitFor(() => rendered.getByText('test'));
  });
});
// const createQueryClient = () => new QueryClient();

// const TestComponent = ({ queryKey, queryFn, delay, cron }) => {
//   const result = useSchedule({ queryKey, queryFn, delay, cron });
//   return (
//     <div>
//       <div data-testid="status">{result.status}</div>
//       <div data-testid="data">{result.data}</div>
//       <div data-testid="error">{result.error?.message}</div>
//     </div>
//   );
// };

// describe('useSchedule hook', () => {
//   it('fetches data with delay', async () => {
//     jest.useFakeTimers();
//     const queryClient = createQueryClient();
//     const mockQueryFn = jest.fn(async () => 'data');

//     render(
//       <QueryClientProvider client={queryClient}>
//         <TestComponent queryKey={['test']} queryFn={mockQueryFn} delay={100} />
//       </QueryClientProvider>
//     );

//     expect(mockQueryFn).not.toHaveBeenCalled();

//     act(() => {
//       jest.advanceTimersByTime(100);
//     });

//     await waitFor(() => screen.getByTestId('status').textContent === 'success');
//     expect(mockQueryFn).toHaveBeenCalledTimes(1);
//     expect(screen.getByTestId('data').textContent).toBe('data');

//     jest.useRealTimers();
//   });

//   it('refetches on cron schedule', async () => {
//     jest.useFakeTimers();
//     const queryClient = createQueryClient();
//     const mockQueryFn = jest.fn(async () => 'cron data');
//     const cron = '* * * * * *';

//     render(
//       <QueryClientProvider client={queryClient}>
//         <TestComponent queryKey={['cronTest']} queryFn={mockQueryFn} cron={cron} />
//       </QueryClientProvider>
//     );

//     await waitFor(() => screen.getByTestId('status').textContent === 'success');
//     expect(mockQueryFn).toHaveBeenCalledTimes(1);

//     act(() => {
//       jest.advanceTimersByTime(1000);
//     });

//     await waitFor(() => mockQueryFn.mock.calls.length === 2);
//     expect(mockQueryFn).toHaveBeenCalledTimes(2);

//     jest.useRealTimers();
//   });

//   it('handles query errors', async () => {
//     jest.useFakeTimers();
//     const queryClient = createQueryClient();
//     const mockQueryFn = jest.fn(async () => {
//       throw new Error('fetch error');
//     });

//     render(
//       <QueryClientProvider client={queryClient}>
//         <TestComponent queryKey={['errorTest']} queryFn={mockQueryFn} delay={50} />
//       </QueryClientProvider>
//     );

//     act(() => {
//       jest.advanceTimersByTime(50);
//     });

//     await waitFor(() => screen.getByTestId('status').textContent === 'error');
//     expect(mockQueryFn).toHaveBeenCalledTimes(1);
//     expect(screen.getByTestId('error').textContent).toBe('fetch error');

//     jest.useRealTimers();
//   });
// });
