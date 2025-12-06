const SNAPSHOTS_DIR = 'snapshots';
const SOURCE_FILENAME = 'source';
const NORMALIZED_FILENAME = 'normalized';
const META_FILENAME = 'meta';

/**
 * Snapshot version strategy.
 */
const VersionStrategyName = {
  infer: 'infer',
  manual: 'manual',
} as const;
type VersionStrategyName = keyof typeof VersionStrategyName;
type VersionStrategyInfer = typeof VersionStrategyName.infer;
type VersionStrategyManual = {
  type: 'manual';
  version: string | (() => string);
};
type VersionStrategy = VersionStrategyInfer | VersionStrategyManual;
/**
 * Snapshot folders
 */
type SnapshotFolderRoot = string;
type SnapshotFolderDetailed = {
  root: SnapshotFolderRoot;
  subfolder: string;
};
/**
 * Snapshot files
 **/
type SnapshotFile = {
  source: string;
  normalized: string;
  meta: string;
};

const SnapshotFileExtensionName = {
  infer: 'infer',
  json: 'json',
  yaml: 'yaml',
} as const;
type SnapshotFileExtension = keyof typeof SnapshotFileExtensionName;
type SnapshotExtensions = {
  source: SnapshotFileExtension;
  normalized: SnapshotFileExtension;
};

type SnapshotFolder = SnapshotFolderRoot | SnapshotFolderDetailed;
export type SnapshotConfig = {
  /**
   * Enable snapshot.
   * @default true
   */
  enabled?: boolean;
  /**
   * Snapshot root folder.
   * @default SNAPSHOTS_DIR
   */
  folder?: SnapshotFolder;
  /**
   * Snapshot files.
   * @default {...}
   */
  files?: SnapshotFile;
  /**
   * Snapshot file extensions.
   * @default {...}
   */
  extensions?: SnapshotExtensions;
  /**
   * The snapshot version strategy.
   * @default 'infer'
   */
  versionStrategy?: VersionStrategy;
};

export const defaultSnapshotConfig: Required<SnapshotConfig> = {
  enabled: true,
  folder: SNAPSHOTS_DIR,
  files: {
    source: SOURCE_FILENAME,
    normalized: NORMALIZED_FILENAME,
    meta: META_FILENAME,
  },
  extensions: {
    source: SnapshotFileExtensionName.infer,
    normalized: SnapshotFileExtensionName.json,
  },
  versionStrategy: VersionStrategyName.infer,
};
