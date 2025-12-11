import { ParserConfig } from '@/core/parser/config';
import { SnapshotConfig } from '@/core/snapshot/config';

export type OpenapiGenConfig = {
  /**
   * The config file path.
   * @default 'specnova.config'
   */
  configFile?: 'specnova.config' | string;
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
  normalized?: ParserConfig | null;
  /**
   * The snapshot configuration.
   * @default {...}
   */
  snapshot?: SnapshotConfig;
};

type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K];
};

export type ResolvedOpenapiGenConfig = DeepRequired<OpenapiGenConfig>;
