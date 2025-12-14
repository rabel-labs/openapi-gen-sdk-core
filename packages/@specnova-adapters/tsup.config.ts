import { defineConfig } from 'tsup';

export default defineConfig([
  // Library
  {
    entry: ['src/adapters/**/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    splitting: true,
    treeshake: true,
    external: ['@rabel-lab/specnova', '@hey-api/openapi-ts'],
    outDir: 'dist/adapters',
    target: 'es2022',
  },
]);
