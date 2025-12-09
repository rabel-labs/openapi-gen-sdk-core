import { Info } from '@/core/extracter/info/type';
import { SnapshotConfig, SnapshotFileExtension } from '@/core/snapshot/config';
import { buildMetaFile, buildMetaPath, buildMetaSourceFiles } from '@/core/snapshot/meta/lib/build';
import { OpenApiSource } from '@/utils';

import { readFileSync, writeFileSync } from 'fs';

export type SnapshotMetaFiles = {
  names: {
    source: string;
    normalized: string;
  };
  extensions: {
    source: SnapshotFileExtension;
    normalized: SnapshotFileExtension;
  };
};
export type SnapshoMetaExtension = {
  source: SnapshotFileExtension;
  normalized: SnapshotFileExtension;
};
export type SnapshotMetaSignatures = {
  source: string;
  normalized: string;
  meta: string;
};

type SnapshotMetaData = {
  info: Info;
  path: string;
  config: Required<SnapshotConfig>;
  files: SnapshotMetaFiles;
  sha256: SnapshotMetaSignatures;
};

class SnapshotMetaImpl {
  info: Info;
  path: string;
  config: Required<SnapshotConfig>;
  files: SnapshotMetaFiles;
  sha256: SnapshotMetaSignatures;
  constructor(data: SnapshotMetaData) {
    this.info = data.info;
    this.path = data.path;
    this.config = data.config;
    this.files = data.files;
    this.sha256 = data.sha256;
  }
}

type SnapshotMetaConstructor_Clone = {
  meta: SnapshotMetaData;
};

type SnapshotMetaConstructor_New = {
  openapiSource: OpenApiSource;
  config: Required<SnapshotConfig>;
};

type SnapshotMetaConstructor = SnapshotMetaConstructor_Clone | SnapshotMetaConstructor_New;

export class SnapshotMeta extends SnapshotMetaImpl {
  constructor(args: SnapshotMetaConstructor_Clone);
  constructor(args: SnapshotMetaConstructor_New);
  constructor(args: SnapshotMetaConstructor) {
    if ('meta' in args) {
      super(args.meta);
      return;
    } else if ('openapiSource' in args && 'config' in args) {
      const { openapiSource, config } = args;
      super({
        info: openapiSource.info,
        path: buildMetaPath(config, openapiSource.info.version),
        files: buildMetaSourceFiles(config, openapiSource),
        config,
        sha256: {
          source: '',
          normalized: '',
          meta: '',
        },
      });
    }
  }

  static pull(info: Info, config: Required<SnapshotConfig>): SnapshotMeta {
    const path = buildMetaPath(config, info.version);
    const metaFile = buildMetaFile();
    const pathTo = `${path}/${metaFile.file}`;
    const text = readFileSync(pathTo);
    try {
      const pulledMeta = JSON.parse(text.toString()) as SnapshotMetaData;
      //... clone
      return new SnapshotMeta({ meta: pulledMeta });
    } catch {
      throw new Error('Snapshot: failed to load meta');
    }
  }

  public async push() {
    const metaFile = buildMetaFile();
    const pathTo = `${this.path}/${metaFile.file}`;
    const text = JSON.stringify(this, null, 2);
    try {
      writeFileSync(pathTo, text);
      return true;
    } catch {
      throw new Error('Snapshot: failed to save meta');
    }
  }
}
