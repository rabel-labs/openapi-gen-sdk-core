const SNAPSHOTS_DIR = 'snapshots';
const SOURCE_FILENAME = 'source';
const NORMALIZED_FILENAME = 'normalized';
const META_FILENAME = 'meta';

const InferKey = 'infer' as const;
type InferKey = typeof InferKey;
/**
 * Snapshot version strategy.
 */
const VersionStrategyName = {
  infer: InferKey,
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
const SnapshotFileSlots = {
  source: 'source',
  normalized: 'normalized',
  meta: 'meta',
} as const;
export type SnapshotFileSlots = keyof typeof SnapshotFileSlots;

type SnapshotFiles = {
  [key in SnapshotFileSlots]: string;
};

/**
 * Snapshot file extensions.
 */
const SnapshotFileExtensionName = {
  json: 'json',
  yaml: 'yaml',
} as const;
export type SnapshotFileExtension = keyof typeof SnapshotFileExtensionName;

type SnapshotExtensions = {
  [key in Exclude<SnapshotFileSlots, 'meta'>]: SnapshotFileExtension | InferKey;
} & {
  meta: typeof SnapshotFileExtensionName.json;
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
   * @default {...}
   */
  folder?: SnapshotFolder;
  /**
   * Snapshot files.
   * @default {...}
   */
  files?: SnapshotFiles;
  /**
   * Snapshot file extensions.
   * @default {...}
   */
  extensions?: SnapshotExtensions;
  /**
   * The snapshot version strategy.
   * @default {...}
   */
  versionStrategy?: VersionStrategy;
};

/**
 * Type guard for SnapshotFileExtensionName
 * @param extension - SnapshotFileExtensionName
 */
export function isSnapshotFileExtensionName(extension: string): extension is SnapshotFileExtension {
  return (
    typeof extension === 'string' &&
    (extension === SnapshotFileExtensionName.json || extension === SnapshotFileExtensionName.yaml)
  );
}

export const defaultSnapshotConfig: Required<SnapshotConfig> = {
  enabled: true,
  folder: SNAPSHOTS_DIR,
  files: {
    source: SOURCE_FILENAME,
    normalized: NORMALIZED_FILENAME,
    meta: META_FILENAME,
  },
  extensions: {
    source: InferKey,
    normalized: SnapshotFileExtensionName.json,
    meta: 'json',
  },
  versionStrategy: VersionStrategyName.infer,
} as const;
