import { SnapshotConfig, SnapshotFileExtension } from '@/core/snapshot/config';
import { SnapshotMetaFiles } from '@/core/snapshot/meta/base';
import { OpenApiSource } from '@/utils';

const META_EXT = 'json' satisfies SnapshotFileExtension;
const META_FILE = `meta.${META_EXT}`;

export function buildMetaPath(snapshotConfig: Required<SnapshotConfig>, version: string): string {
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
  config: Required<SnapshotConfig>,
  openapiSource: OpenApiSource,
): SnapshotMetaFiles {
  let sourceExtension: SnapshotFileExtension;
  switch (config.extensions.source) {
    case 'json':
      sourceExtension = 'json';
      break;
    case 'yaml':
      sourceExtension = 'yaml';
      break;
    case 'infer':
    default:
      sourceExtension = openapiSource!.extension;
  }
  let normalizedExtension: SnapshotFileExtension;
  switch (config.extensions.normalized) {
    case 'yaml':
      normalizedExtension = 'yaml';
      break;
    case 'infer':
      normalizedExtension = openapiSource!.extension;
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
  } satisfies SnapshotMetaFiles['extensions'];
  //-> Set names
  const names = {
    source: `${config.files.source}.${extensions.source}`,
    normalized: `${config.files.normalized}.${extensions.normalized}`,
    meta: `${config.files.meta}.${extensions.meta}`,
  } satisfies SnapshotMetaFiles['names'];

  return {
    extensions,
    names,
  };
}
