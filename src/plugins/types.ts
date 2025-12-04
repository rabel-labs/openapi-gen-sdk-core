import { ParserOperationIdConfig } from '@/core/parser/operationId/config';

import type { DefinePlugin } from '@hey-api/openapi-ts';

type NormalizeFunc = (operationId: string, path: string, method: string) => string;
type SkipNormalizeFunc = (path: string, method: string) => boolean;

export type OpenapiGenPluginConfig = {
  /**
   * The plugin name.
   */
  name: '@openapiGen/core';
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
   * @default {}
   */
  parser?: {
    /**
     * Parse OperationId.
     * @default undefined
     */
    operationId?: Partial<ParserOperationIdConfig>;
    /**
     * Sort paths.
     * @default undefined
     */
    sort?: 'paths' | 'methods' | (() => void);
    /**
     * Filter paths.
     * @default undefined
     */
    filter?: () => boolean;
    /**
     * Reject paths.
     * @default undefined
     */
    reject?: () => boolean;
  };
  /**
   * The snapshot configuration.
   * @default {}
   */
  snapshot?: {
    /**
     * Enable snapshot.
     * @default true
     */
    enabled?: boolean;
    /**
     * The snapshot folder.
     * @default './snapshots'
     */
    folder?: string;
    /**
     * The snapshot version strategy.
     * @default 'infer-semver'
     */
    versionStrategy?: 'infer' | 'manual';
  };
};

export type OpenapiGenPlugin = DefinePlugin<OpenapiGenPluginConfig>;
