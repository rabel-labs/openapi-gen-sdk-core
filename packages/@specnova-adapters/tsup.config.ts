import { defineConfig } from 'tsup';

export default defineConfig([
  // Library
  {
    entry: ['adapters/**/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    splitting: true,
    treeshake: true,
    outDir: 'dist/adapters',
    target: 'es2022',
  },
]);
