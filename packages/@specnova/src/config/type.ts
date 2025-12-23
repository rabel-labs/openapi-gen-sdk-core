import { parserConfig } from '@/core/parser/config';
import { snapshotConfig } from '@/core/snapshot/config';

import z from 'zod';

export const specnovaConfig = z.object({
  /**
   * The parser configuration.
   * @default {...}
   */
  normalized: parserConfig.nullable().optional().default(null),
  /**
   * The snapshot configuration.
   * @default {...}
   */
  snapshot: snapshotConfig,
});

export type SpecnovaConfig = z.infer<typeof specnovaConfig>;

export type Resolved<T> = T & {
  [K in keyof T]-?: Resolved<T[K]>;
};

export type ResolvedSpecnovaConfig = Resolved<SpecnovaConfig>;
