import { ResolvedSpecnovaConfig } from '@/config/type';
import { snapshotMetaDataSchema } from '@/core/snapshot/meta/base';
import { SpecnovaSource } from '@/types';
import { SnapshotFileExtension } from '@/types/files';

import z from 'zod';

const META_EXT = 'json' satisfies SnapshotFileExtension;
const META_FILE = `meta.${META_EXT}`;

export function buildMetaPath(config: ResolvedSpecnovaConfig, version: string): string {
  //!TODO: Ensure semver version is used
  const snapshotConfig = config.snapshot;
  const rootDir =
    typeof snapshotConfig.folder === 'string' ? snapshotConfig.folder : snapshotConfig.folder.root;
  return `${rootDir}/${version}`;
}

export function buildMetaFile(): { file: string; extension: SnapshotFileExtension } {
  const file = META_FILE;
  const extension = META_EXT;
  return {
    file,
    extension,
  };
}

export function buildMetaSourceFiles(
  config: ResolvedSpecnovaConfig,
  specnovaSource: SpecnovaSource,
): z.infer<typeof snapshotMetaDataSchema.shape.files> {
  const snapshotConfig = config.snapshot;
  let sourceExtension: SnapshotFileExtension;
  switch (snapshotConfig.extensions.source) {
    case 'json':
      sourceExtension = 'json';
      break;
    case 'yaml':
    case 'yml':
      sourceExtension = 'yaml';
      break;
    case 'infer':
    default:
      sourceExtension = specnovaSource!.extension;
  }
  let normalizedExtension: SnapshotFileExtension;
  switch (snapshotConfig.extensions.normalized) {
    case 'yaml':
    case 'yml':
      normalizedExtension = 'yaml';
      break;
    case 'infer':
      normalizedExtension = specnovaSource!.extension;
    case 'json':
    default:
      normalizedExtension = 'json';
      break;
  }
  //-> Set extension
  const extensions = {
    source: sourceExtension,
    normalized: normalizedExtension,
    meta: 'json',
  } satisfies z.infer<typeof snapshotMetaDataSchema.shape.files.shape.extensions>;
  //-> Set names
  const names = {
    source: `${snapshotConfig.names.source}.${extensions.source}`,
    normalized: `${snapshotConfig.names.normalized}.${extensions.normalized}`,
    meta: `${snapshotConfig.names.meta}.${extensions.meta}`,
  } satisfies z.infer<typeof snapshotMetaDataSchema.shape.files.shape.names>;

  return {
    extensions,
    names,
  };
}
