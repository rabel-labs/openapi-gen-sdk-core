import { defineConfig } from 'eslint/config';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import simpleSort from 'eslint-plugin-simple-import-sort';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig({
  files: ['src/**/*.ts', 'src/**/*.tsx'],
  ignores: ['node_modules', 'dist', 'build', 'snapshots'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: './tsconfig.json',
    },
  },
  plugins: {
    '@typescript-eslint': tsPlugin,
    'simple-import-sort': simpleSort,
    prettier: prettierPlugin,
  },
  rules: {
    ...prettierConfig.rules.recommended,
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
    'prettier/prettier': 'error',
  },
});
