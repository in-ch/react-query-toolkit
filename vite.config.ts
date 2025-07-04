import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@react-query-toolkits': path.resolve(__dirname, 'packages/react-query-toolkits'),
    },
  },
});
