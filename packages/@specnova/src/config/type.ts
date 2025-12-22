import { ParserConfig } from '@/core/parser/config';
import { SnapshotConfig } from '@/core/snapshot/config';

export type SpecnovaConfig = {
  /**
   * Syncronize the Specnova source version with the package.json version.
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

export type Resolved<T> = T & {
  [K in keyof T]-?: Resolved<T[K]>;
};

export type ResolvedSpecnovaConfig = Resolved<SpecnovaConfig>;
