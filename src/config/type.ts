import { ParserOperationIdConfig } from '@/core/parser/operationId/config';
import { SnapshotConfig } from '@/core/snapshot/config';

export type OpenapiGenConfig = {
  /**
   * Syncronize the OpenAPI source version with the package.json version.
   * @default false
   */
  syncVersion?: boolean;
  /*
   * Merge inputs.
   * @default false
   */
  mergeInputs?: boolean;
  /**
   * The parser configuration.
   * @default {...}
   */
  normalized?: {
    /**
     * Parse OperationId.
     * @default null
     */
    operationId?: Partial<ParserOperationIdConfig> | null;
    /**
     * Sort paths.
     * @default null
     */
    sort?: null;
    /**
     * Filter paths.
     * @default null
     */
    filter?: null;
    /**
     * Reject paths.
     * @default null
     */
    reject?: null;
  } | null;
  /**
   * The snapshot configuration.
   * @default {...}
   */
  snapshot?: SnapshotConfig;
};
