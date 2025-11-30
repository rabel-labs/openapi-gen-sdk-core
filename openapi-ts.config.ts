import { defineConfig } from '@hey-api/openapi-ts';
import { defineOpenapiGenConfig } from './src/plugins/config';

export default defineConfig({
  input: 'hey-api/backend',
  output: 'src/client',
});
