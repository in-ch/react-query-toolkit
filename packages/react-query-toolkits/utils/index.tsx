import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

export function createQueryClient(config?: QueryClientConfig): QueryClient {
  return new QueryClient(config);
}

export function queryKey(): string[] {
  const randomString = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  return [`query_${randomString}`];
}

export function renderWithClient(client: QueryClient, ui: React.ReactElement): ReturnType<typeof render> {
  const { rerender, ...result } = render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
  return {
    ...result,
    rerender: (rerenderUi: React.ReactElement) =>
      rerender(<QueryClientProvider client={client}>{rerenderUi}</QueryClientProvider>),
  };
}

export function sleep(timeout: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

export const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export const fetchMock = async (page: number, limit: number) => {
  return new Promise(resolve =>
    setTimeout(() => {
      resolve(Array.from({ length: limit }, (_, i) => i + (page - 1) * limit));
    }, 10)
  );
};
