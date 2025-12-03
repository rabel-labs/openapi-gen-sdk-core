import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: ['node_modules', 'dist', 'build', 'snapshots'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['./*', '../*'], // blocks both ./ and ../ relative imports
        },
      ],
    },
  },
];
