# React Query Toolkits 🚀

A comprehensive collection of advanced React Query hooks that extend the functionality of TanStack Query with powerful patterns and utilities.

## Installation

```bash
npm install @tanstack/react-query
npm install react-query-toolkits

# or

yarn install @tanstack/react-query
yarn add react-query-toolkits

# or

pnpm install @tanstack/react-query
pnpm add react-query-toolkits
```

## Usage

### 🕐 `useCronQuery`

Execute queries based on cron expressions with precise scheduling control.

```typescript
import { useCronQuery } from 'react-query-toolkits';

const { data, status, error } = useCronQuery({
  queryKey: ['scheduled-data'],
  queryFn: () => fetchScheduledData(),
  cronExpression: '0 */5 * * * *', // Every 5 minutes
  cronEnabled: true,
});
```

---

### ⏱️ `useDebouncedQuery`

Debounce query execution to prevent excessive API calls during rapid state changes.

```typescript
import { useDebouncedQuery } from 'react-query-toolkits';

const { data, isLoading, page, setPage, limit, setLimit } = useDebouncedQuery({
  queryKey: ['users'],
  queryFn: (page, limit) => fetchUsers(page, limit),
  delay: 1000,
});
```

---

### 🔗 `useDependentQuery`

Execute queries in sequence where each depends on the result of the previous one.

```typescript
import { useDependentQuery } from 'react-query-toolkits';

const { data, isLoading } = useDependenciesQuery({
  queryKey: ['user'],
  queryFn: () => fetchUser(userId),
  dependencies: [userId],
});
```

---

### ⏰ `useInterval`

Execute callbacks at regular intervals with automatic cleanup and control.

```typescript
import { useInterval } from 'react-query-toolkits';

useInterval(() => {
  console.log('Tick');
}, 1000);
```

---

### 🚀 `useLazyQuery`

Execute queries manually with on-demand triggering.

```typescript
import { useLazyQuery } from 'react-query-toolkits';

const { refetch, data, isLoading } = useLazyQuery({
  queryKey: ['users'],
  queryFn: (page, limit) => fetchUsers(page, limit),
});

refetch();
```

---

### 📄 `usePaginatedQuery`

Handle paginated data with built-in pagination controls and state management.

```typescript
import { usePaginatedQuery } from 'react-query-toolkits';

const { data, isLoading, page, setPage, limit, setLimit } = usePaginatedQuery({
  queryKey: ['users'],
  queryFn: (page, limit) => fetchUsers(page, limit),
  initialPage: 1,
  initialLimit: 20,
});
```

---

### 🔄 `useParallelQuery`

Execute multiple queries in parallel and get combined results.

```typescript
import { useParallelQuery } from 'react-query-toolkits';

const { results, isLoading, isError, isSuccess, errors, data, refetchAll } = useParallelQuery([
  { queryKey: ['query1'], queryFn: () => fetch('https://api.example.com/query1') },
  { queryKey: ['query2'], queryFn: () => fetch('https://api.example.com/query2') },
]);
```

---

### ⚡ `usePrefetchQuery`

Intelligently prefetch data based on user interactions and conditions.

```typescript
import { usePrefetchQuery } from 'react-query-toolkits';

const { prefetch, isLoading } = usePrefetchQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});

useEffect(() => {
  if (shouldPrefetch) {
    prefetch();
  }
}, [shouldPrefetch]);
```

---

### 📅 `useSchedule`

Schedule queries with optional delays and interval-based refetching.

```typescript
import { useSchedule } from 'react-query-toolkits';

const { data, refetch } = useSchedule({
  queryKey: ['example'],
  queryFn: async () => fetchExampleData(),
  delay: 1000,
  interval: 500, // Every 500 ms
});
```

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history and breaking changes.

---

**React Query Toolkits** - Supercharge your data fetching with powerful, reusable patterns! 🚀
