import { QueryClient, QueryClientConfig, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

export function createQueryClient(config?: QueryClientConfig): QueryClient {
  return new QueryClient(config);
}

let queryKeyCount = 0;
export function queryKey(): Array<string> {
  queryKeyCount++;
  return [`query_${queryKeyCount}`];
}

export function renderWithClient(client: QueryClient, ui: React.ReactElement): ReturnType<typeof render> {
  const { rerender, ...result } = render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
  return {
    ...result,
    rerender: (rerenderUi: React.ReactElement) =>
      rerender(<QueryClientProvider client={client}>{rerenderUi}</QueryClientProvider>),
  } as any;
}
11;

export function sleep(timeout: number): Promise<void> {
  return new Promise((resolve, _reject) => {
    setTimeout(resolve, timeout);
  });
}
