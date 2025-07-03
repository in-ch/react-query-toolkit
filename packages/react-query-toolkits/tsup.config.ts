import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['./index.ts'],
  external: ['react-query-toolkits/package.json'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  minify: true,
  target: 'esnext',
  outDir: 'dist',
});
