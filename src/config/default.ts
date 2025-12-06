import { OpenapiGenConfig } from '@/config/type';
import { defaultParserConfig } from '@/core/parser/config';
import { defaultSnapshotConfig } from '@/core/snapshot/config';

export const defaultOpenapiGenConfig = {
  syncVersion: false,
  mergeInputs: false,
  normalized: defaultParserConfig,
  snapshot: defaultSnapshotConfig,
} satisfies Required<OpenapiGenConfig>;
