import { describe, expect, it, vi } from 'vitest';
import useLazyQuery from '@/hooks/use-lazy-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/react';

describe('useLazyQuery', () => {
  const createQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  it('should NOT fetch data initially', () => {
    const mockFn = vi.fn().mockResolvedValue('hello');
    function Page() {
      const { status, isLoading } = useLazyQuery({
        queryKey: ['test'],
        queryFn: mockFn,
      });

      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="isLoading">{isLoading}</div>
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
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should fetch data when refetch is called', async () => {
    const mockFn = vi.fn().mockResolvedValue('hello');

    function Page() {
      const { data, refetch, status } = useLazyQuery({
        queryKey: ['test'],
        queryFn: mockFn,
      });

      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="data">{String(data)}</div>
          <button onClick={() => refetch()}>Fetch</button>
        </div>
      );
    }

    const client = createQueryClient();
    render(
      <QueryClientProvider client={client}>
        <Page />
      </QueryClientProvider>
    );

    expect(mockFn).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Fetch'));

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('success');
      expect(screen.getByTestId('data').textContent).toBe('hello');
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when refetch is called', async () => {
    const error = new Error('ERROR!!!');
    const mockFn = vi.fn().mockRejectedValue(error);

    function Page() {
      const {
        error: queryError,
        refetch,
        status,
      } = useLazyQuery({
        queryKey: ['test'],
        queryFn: mockFn,
      });

      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{(queryError as Error)?.message}</div>
          <button onClick={() => refetch()}>Fetch</button>
        </div>
      );
    }

    const client = createQueryClient();
    render(
      <QueryClientProvider client={client}>
        <Page />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByText('Fetch'));

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('error');
      expect(screen.getByTestId('error').textContent).toBe('ERROR!!!');
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
