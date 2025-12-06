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
type SnapshotFileNames = {
  source: string;
  normalized: string;
  meta: string;
};

const SnapshotFileExtensionName = {
  json: 'json',
  yaml: 'yaml',
} as const;

export type SnapshotFileExtension = keyof typeof SnapshotFileExtensionName;

type SnapshotExtensions = {
  source: SnapshotFileExtension | InferKey;
  normalized: SnapshotFileExtension | InferKey;
  meta: 'json';
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
  files?: SnapshotFileNames;
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
