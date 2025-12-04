import { defaultParserOperationIdConfig } from '@/core/parser/operationId/config';
import { handler } from '@/plugins/plugin';
import { OpenapiGenPlugin } from '@/plugins/types';

import { definePluginConfig } from '@hey-api/openapi-ts';

export const openapiGenConfigName: OpenapiGenPlugin['Config']['name'] = '@openapiGen/core';
export const defaultOpenapiGenConfig: OpenapiGenPlugin['Config'] = {
  name: openapiGenConfigName,
  config: {
    syncVersion: false,
    mergeInputs: false,
    parser: {
      operationId: defaultParserOperationIdConfig,
      sort: undefined,
      filter: undefined,
      reject: undefined,
    },
    snapshot: {
      enabled: true,
      folder: './snapshots',
      versionStrategy: 'infer', // or "manual"
    },
  },
  handler: handler,
};

export const defineOpenapiGenConfig = definePluginConfig(defaultOpenapiGenConfig);
