import { OpenapiGenConfig } from '@/config/type';
import { defaultParserOperationIdConfig } from '@/core/parser/operationId/config';
import { defaultSnapshotConfig } from '@/core/snapshot/config';

export const defaultOpenapiGenConfig: Required<OpenapiGenConfig> = {
  syncVersion: false,
  mergeInputs: false,
  parser: {
    operationId: defaultParserOperationIdConfig,
    sort: null,
    filter: null,
    reject: null,
  },
  snapshot: defaultSnapshotConfig,
};
