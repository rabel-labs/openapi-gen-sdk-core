import { defaultOpenapiGenConfig } from '@/config/default';
import { OpenapiGenConfig } from '@/config/type';
import { handler } from '@/plugins/plugin';

import { DefinePlugin, definePluginConfig } from '@hey-api/openapi-ts';

export type OpenapiGenPlugin = DefinePlugin<OpenapiGenConfig & { name: '@openapiGen/core' }>;

export const openapiGenConfigName: OpenapiGenPlugin['Config']['name'] = '@openapiGen/core';

export const defineOpenapiGenConfig = definePluginConfig({
  name: openapiGenConfigName,
  config: defaultOpenapiGenConfig,
  handler: handler,
} as OpenapiGenPlugin['Config']);
