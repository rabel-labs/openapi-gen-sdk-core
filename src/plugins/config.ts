import { definePluginConfig } from '@hey-api/openapi-ts';
import { OpenapiGenPlugin } from './types';
import { handler } from './plugin';

export const openapiGenConfigName: OpenapiGenPlugin['Config']['name'] = '@openapiGen/core';
export const defaultOpenapiGenConfig: OpenapiGenPlugin['Config'] = {
  name: openapiGenConfigName,
  config: {
    syncVersion: false,
    mergeInputs: false,
    parser: {
      operationId: undefined,
      sort: undefined,
      filter: undefined,
      reject: undefined,
    },
  },
  handler: handler,
};

export const defineOpenapiGenConfig = definePluginConfig(defaultOpenapiGenConfig);
