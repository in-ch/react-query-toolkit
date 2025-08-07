import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React, { Suspense } from 'react';
import { useFetch } from '@inspense/useFetch';
import { render, screen, waitFor } from '@testing-library/react';

interface TestComponentProps {
  url: string;
  fetcher?: (url: string) => Promise<any>;
}

function TestComponent({ url, fetcher }: TestComponentProps) {
  const { data } = useFetch<{ name: string }>(url, fetcher);
  return <div>Data: {data.name}</div>;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div>Error caught: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
}

describe('useFetch', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch data using the default fetcher and render it', async () => {
    const mockData = { name: 'success' };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })
    );

    render(
      <Suspense fallback={<div>loading....</div>}>
        <TestComponent url="https://api.example.com/data" />
      </Suspense>
    );

    expect(screen.getByText('loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Data: success')).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('https://api.example.com/data');
  });

  it('should use the custom fetcher when provided', async () => {
    const mockData = { name: 'data' };
    const customFetcher = vi.fn().mockResolvedValue(mockData);

    vi.stubGlobal('fetch', vi.fn());

    render(
      <Suspense fallback={<div>loading...</div>}>
        <TestComponent url="https://api.example.com/custom" fetcher={customFetcher} />
      </Suspense>
    );

    expect(screen.getByText('loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('data')).toBeInTheDocument();
    });

    expect(customFetcher).toHaveBeenCalledWith('https://api.example.com/custom');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should be caught by an error boundary when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })
    );

    render(
      <ErrorBoundary>
        <Suspense fallback={<div>loading...</div>}>
          <TestComponent url="https://api.example.com/error" />
        </Suspense>
      </ErrorBoundary>
    );

    expect(screen.getByText('loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Error caught: Failed to fetch: 500/)).toBeInTheDocument();
    });
  });
});
