import { OpenapiGenConfig } from '@/config/type';
import { defaultParserOperationIdConfig } from '@/core/parser/operationId/config';
import { defaultSnapshotConfig } from '@/core/snapshot/config';

export const defaultOpenapiGenConfig = {
  syncVersion: false,
  mergeInputs: false,
  normalized: {
    operationId: defaultParserOperationIdConfig,
    sort: null,
    filter: null,
    reject: null,
  },
  snapshot: defaultSnapshotConfig,
} satisfies Required<OpenapiGenConfig>;
