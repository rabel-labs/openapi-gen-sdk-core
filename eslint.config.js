// Source - https://stackoverflow.com/questions/76937999/how-to-setup-lint-staged-with-turbo-monorepo
// Posted by Nick Salloum, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-11, License - CC BY-SA 4.0

import baseConfig from '@specnova/eslint-config/base';

export default [
  ...baseConfig,
  // Map other configs to the same files
];
