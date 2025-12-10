import { Info } from '@/core/extracter/info/type';
import { SnapshotConfig, SnapshotFileExtension, SnapshotFileSlots } from '@/core/snapshot/config';
import { buildMetaFile, buildMetaPath, buildMetaSourceFiles } from '@/core/snapshot/meta/lib/build';
import { compareSha256, digestString, Sha256String } from '@/core/snapshot/meta/lib/compare';
import { OpenApiSource } from '@/utils';

import { readFileSync } from 'fs';
import { mkdir, rename, rm, writeFile } from 'fs/promises';
import { join as pathJoin } from 'path';

const TEMP_FOLDER = '.tmp-write';

export type SnapshotMetaFiles = {
  names: {
    [key in SnapshotFileSlots]: string;
  };
  extensions: {
    [key in SnapshotFileSlots]: SnapshotFileExtension;
  };
};

export type SnapshotMetaHashes = {
  [key in SnapshotFileSlots]: Promise<Sha256String> | null;
};

type SnapshotMetaData = {
  info: Info;
  path: string;
  config: Required<SnapshotConfig>;
  files: SnapshotMetaFiles;
  sha256: SnapshotMetaHashes;
};

type SnapshotMetaDigestors = {
  [key in SnapshotFileSlots]?: string;
};

type SnapshotMetaDocuments = {
  [key in SnapshotFileSlots]?: {
    text: string;
    digest: Promise<Sha256String>;
  };
};

class SnapshotMetaImpl {
  private lock: boolean = false;
  private data: SnapshotMetaData;
  protected softData: SnapshotMetaData;
  protected documents: SnapshotMetaDocuments = {};

  constructor(data: SnapshotMetaData) {
    this.data = data;
    this.softData = data;
  }

  private apply() {
    this.softData = this.data;
  }

  private clear() {
    this.softData = this.data;
    this.documents = {};
    this.lock = false;
  }

  private startCommit() {
    this.lock = true;
  }

  private async endCommit() {
    //-> write all documents & save if all successful
    const documentEntries = Object.entries(this.documents);
    const tempFolder = pathJoin(this.softData.path, TEMP_FOLDER);
    const destFolder = this.softData.path;
    const files = this.softData.files;
    await mkdir(tempFolder, { recursive: true });
    try {
      //# Write all files into temp folder
      await Promise.all(
        documentEntries.map(([key, value]) => {
          const { text } = value;
          const file = files.names[key as SnapshotFileSlots];
          return writeFile(pathJoin(tempFolder, file), text);
        }),
      );
      //# Move them only if ALL writes succeeded
      await Promise.all(
        documentEntries.map(([key]) => {
          return rename(
            pathJoin(tempFolder, files.names[key as SnapshotFileSlots]),
            pathJoin(destFolder, files.names[key as SnapshotFileSlots]),
          );
        }),
      );
      //-> if successful, apply & clear
      console.log(`✅ Applied changes to ${this.softData.path}`);
      this.apply();
      this.clear();
    } catch (e) {
      //# Cleanup
      await rm(tempFolder, { recursive: true, force: true });
      this.lock = false;
      throw e;
    }
    //# Cleanup
    await rm(tempFolder, { recursive: true, force: true });
    this.lock = false;
  }

  protected undo() {
    this.softData = this.data;
    this.documents = {};
  }

  protected async submit() {
    this.startCommit();
    await this.endCommit();
  }

  isLocked() {
    return this.lock;
  }

  get() {
    return this.data;
  }
}

export class SnapshotMeta extends SnapshotMetaImpl {
  constructor(args: { meta: SnapshotMetaData });
  constructor(args: { openapiSource: OpenApiSource; config: Required<SnapshotConfig> });
  constructor(
    args:
      | { meta: SnapshotMetaData }
      | { openapiSource: OpenApiSource; config: Required<SnapshotConfig> },
  ) {
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
          source: Promise.resolve(''),
          normalized: Promise.resolve(''),
          meta: Promise.resolve(''),
        },
      });
    } else {
      throw new Error('Snapshot: invalid meta constructor');
    }
  }

  static pull(version: string, config: Required<SnapshotConfig>): SnapshotMeta {
    const path = buildMetaPath(config, version);
    const metaFile = buildMetaFile();
    const pathTo = pathJoin(path, metaFile.file);
    const text = readFileSync(pathTo);
    try {
      const meta = JSON.parse(text.toString()) as SnapshotMetaData;
      return new SnapshotMeta({ meta });
    } catch {
      throw new Error('Snapshot: failed to load meta');
    }
  }
  //-> Public
  /**
   * Digest a document via sha256 digest.
   * @param target - Specific target to sync.
   * @returns - true if saved, false if failed
   * @default - sync all
   */
  async digest(digester: SnapshotMetaDigestors) {
    Object.entries(digester).map(async ([key, text]) => {
      this.documents[key as keyof SnapshotMetaHashes] = {
        text,
        digest: digestString(text),
      };
    });
  }
  /**
   * Compare the meta to another meta.
   * @param other - The other meta.
   * @returns - true if identical, false if not
   */
  async compare(other: SnapshotMeta): Promise<boolean> {
    //# Check if same as other
    const sha256Compares = Object.entries(this.softData.sha256).map(([indexKey, indexValue]) => {
      const otherValue = other.softData.sha256[indexKey as keyof SnapshotMetaHashes];
      const identical = Boolean(indexValue) === Boolean(otherValue);
      if (identical && indexValue && otherValue) {
        //Is: Identical && not null
        //-> trigger comparison
        return compareSha256([indexValue, otherValue]);
      } else {
        //Is: Not identical(false) : Identical && null(true)
        return identical;
      }
    });
    const matches = [
      //# Version & path
      this.softData.path === other.softData.path,
      this.softData.info.version === other.softData.info.version,
      //# sha256
      await Promise.race(sha256Compares),
    ];
    return matches.every((match) => match === true);
  }
  /**
   * Save the meta to the snapshot path.
   * @returns - true if saved, false if failed
   */
  async commit() {
    const text = JSON.stringify(this.softData, null, 2);
    this.digest({
      meta: text,
    });
    this.submit();
  }
}
