import type { DefinePlugin } from '@hey-api/openapi-ts';

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
    operationId?: 'paths' | 'methods' | (() => string);
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
};

export type OpenapiGenPlugin = DefinePlugin<OpenapiGenPluginConfig>;
