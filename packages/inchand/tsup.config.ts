import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['./index.ts'],
  external: ['inchand/package.json'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  minify: true,
  target: 'esnext',
  outDir: 'dist',
});
