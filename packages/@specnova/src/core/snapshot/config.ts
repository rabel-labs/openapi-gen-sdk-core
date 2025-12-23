import { Resolved } from '@/config/type';
import { snapshotFileExtension } from '@/types/files';

import z from 'zod';

const SNAPSHOTS_DIR = '.snapshots';
const SOURCE_FILENAME = 'source';
const NORMALIZED_FILENAME = 'normalized';
const META_FILENAME = 'meta';

/**
 * Snapshot files
 **/
export const snapshotFileSlots = z.enum(['source', 'normalized', 'meta'] as const);
export type SnapshotFileSlots = z.infer<typeof snapshotFileSlots>;

export const snapshotConfig = z.object({
  /**
   * Enable snapshot.
   * @default true
   */
  enabled: z.boolean().optional().default(true),
  /**
   * Snapshot root folder.
   * @default 'root'
   */
  folder: z
    .union([z.string(), z.object({ root: z.string(), subfolder: z.string() })])
    .default('root'),
  /**
   * Snapshot files.
   * @default {...}
   */
  names: z.record(snapshotFileSlots, z.string()).default({
    source: SOURCE_FILENAME,
    normalized: NORMALIZED_FILENAME,
    meta: META_FILENAME,
  }),
  /**
   * Snapshot file extensions.
   * @default {...}
   */
  extensions: z
    .object({
      source: snapshotFileExtension,
      normalized: snapshotFileExtension,
      meta: snapshotFileExtension.extract(['json']),
    })
    .strict()
    .default({
      source: 'infer',
      normalized: 'json',
      meta: 'json',
    }),
});

export type SnapshotConfig = z.infer<typeof snapshotConfig>;

export const defaultSnapshotConfig: Resolved<SnapshotConfig> = {
  enabled: true,
  folder: SNAPSHOTS_DIR,
  names: {
    source: SOURCE_FILENAME,
    normalized: NORMALIZED_FILENAME,
    meta: META_FILENAME,
  },
  extensions: {
    source: 'infer',
    normalized: 'json',
    meta: 'json',
  },
} as const;
