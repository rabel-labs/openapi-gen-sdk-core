import { defineConfig } from 'tsup';

export default defineConfig([
  // Library
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    outDir: 'dist/lib',
    target: 'es2020',
  },
  // CLI
  {
    entry: ['src/bin/cli.ts'],
    format: ['esm'],
    sourcemap: true,
    shims: true,
    clean: false,
    external: ['commander'],
    outDir: 'dist/bin',
    target: 'es2020',
  },
  // Dev-only build
  {
    entry: ['src/playground.dev.ts'],
    format: ['esm'],
    sourcemap: true,
    clean: false,
    outDir: 'dist/dev',
    target: 'esnext',
  },
]);
