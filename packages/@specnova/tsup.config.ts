import { defineConfig } from 'tsup';

export default defineConfig([
  // Library
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    outDir: 'dist/lib',
    target: 'es2022',
  },
  // CLI
  {
    entry: ['src/bin/cli.ts'],
    format: ['esm'],
    sourcemap: true,
    shims: true,
    clean: false,
    outDir: 'dist/bin',
    target: 'es2022',
  },
  // Dev-only build
  {
    entry: ['src/**.config.ts'],
    format: ['esm'],
    sourcemap: true,
    clean: false,
    outDir: 'dist/dev',
    target: 'es2022',
  },
]);
