import { defineConfig } from 'eslint/config';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import simpleSort from 'eslint-plugin-simple-import-sort';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

export default defineConfig({
  files: ['src/**/*.ts', 'src/**/*.tsx'],
  ignores: ['node_modules', 'dist', 'build', 'snapshots', 'src/playground.config.ts'],
  languageOptions: {
    parser: tsParser,
  },
  plugins: {
    '@typescript-eslint': tsPlugin,
    'simple-import-sort': simpleSort,
    prettier: prettierPlugin,
    'unused-imports': unusedImports,
  },
  rules: {
    // imports
    'no-restricted-imports': [
      'error',
      {
        patterns: ['./*', '../*'],
      },
    ],
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^@/'], // @/... imports first
          ['^[a-z]'], // external
          ['^\\u0000'], // side effect
          ['^\\.'], // relative
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    // prettier
    'prettier/prettier': 'error',
    ...prettierConfig.rules.recommended,
  },
});
