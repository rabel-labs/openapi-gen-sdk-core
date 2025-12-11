import converter from '@/core/converter';
import { Info } from '@/core/extracter/info/type';
import { SnapshotConfig, SnapshotFileExtension, SnapshotFileSlots } from '@/core/snapshot/config';
import { buildMetaFile, buildMetaPath, buildMetaSourceFiles } from '@/core/snapshot/meta/lib/build';
import { compareSha256, digestString, Sha256String } from '@/core/snapshot/meta/lib/compare';
import { OpenApiSource } from '@/utils';

import { readFileSync } from 'fs';
import { mkdir, rename, rm, writeFile } from 'fs/promises';
import { join as pathJoin } from 'path';
import { isDeepStrictEqual } from 'util';

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
  [key in Exclude<SnapshotFileSlots, 'meta'>]?: Promise<Sha256String> | Sha256String;
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
  };
};

class SnapshotMetaImpl {
  private lock: boolean = false;
  private data: SnapshotMetaData;
  protected editData: SnapshotMetaData;
  protected documents: SnapshotMetaDocuments = {};

  constructor(data: SnapshotMetaData) {
    this.data = data;
    this.editData = data;
  }

  private apply() {
    this.editData = this.data;
  }

  private clear() {
    this.editData = this.data;
    this.documents = {};
    this.lock = false;
  }

  /**
   * Ensure meta is unlocked.
   * @throws - if locked
   */
  protected ensureUnlocked() {
    if (this.lock) {
      throw new Error('Snapshot: meta is not locked');
    }
  }

  /**
   * Ensure meta is locked.
   * @throws - if unlocked
   */
  protected ensureLocked() {
    if (!this.lock) {
      throw new Error('Snapshot: meta is locked');
    }
  }

  /**
   * Digest a document via sha256 digest.
   * @param target - Specific target to sync.
   * @returns - true if saved, false if failed
   * @default - sync all
   */
  async addDocument(digester: SnapshotMetaDigestors) {
    this.ensureUnlocked();
    for (const key in digester) {
      switch (key) {
        case 'source':
        case 'normalized':
          if (!digester[key]) continue;
          this.documents[key as keyof SnapshotMetaHashes] = {
            text: digester[key],
          };
          this.editData.sha256[key] = digestString(digester[key]);
          break;
        case 'meta':
          if (!digester[key]) continue;
          this.documents.meta = {
            text: digester[key],
          };
          break;
        default:
          throw new Error('Snapshot: invalid digester key');
      }
    }
  }

  private async prepareMetaSubmit() {
    //# Await Meta hashes
    for (const key in this.editData.sha256) {
      if (!this.editData.sha256[key as keyof SnapshotMetaHashes]) continue;
      this.editData.sha256[key as keyof SnapshotMetaHashes] =
        await this.editData.sha256[key as keyof SnapshotMetaHashes];
    }
    //# Add Meta document
    const text = converter.fromJson(this.editData, true);
    await this.addDocument({
      meta: text,
    });
  }

  private startSubmit() {
    this.lock = true;
  }

  private async endSubmit() {
    //# Prepare data;
    this.ensureLocked();
    const documentEntries = Object.entries(this.documents);
    const tempFolder = pathJoin(this.editData.path, TEMP_FOLDER);
    const destFolder = this.editData.path;
    const files = this.editData.files;
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
      //# if successful, apply & clear
      console.log(`✅ Applied changes to ${this.editData.path}`);
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

  protected async submit() {
    await this.prepareMetaSubmit();
    this.startSubmit();
    await this.endSubmit();
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
      const meta = converter.fromText<SnapshotMetaData>(text.toString(), 'json');
      return new SnapshotMeta({ meta });
    } catch {
      throw new Error('Snapshot: failed to load meta');
    }
  }

  /**
   * Validate the digest compared to this snapshot files
   * @param meta - The meta to validate.
   * @param fileTarget - The file to validate.
   * @returns - true if valid, false if not.
   */
  async validateDigest(
    meta: SnapshotMeta = this,
    fileTarget: keyof SnapshotMetaHashes,
  ): Promise<boolean> {
    //# Get This snapshot files
    const { path, files } = this.get();
    //# Get target snapshot hases
    const { sha256: targetHashes } = meta.get();
    const hash = targetHashes[fileTarget];
    //# Validate
    const filePath = pathJoin(path, files.names[fileTarget]);
    if (!hash) return Promise.resolve(false);
    return compareSha256(hash, filePath);
  }
  /**
   * Make other is from the same meta family.
   * Via comparing info,
   * @param other - The other meta.
   * @returns - true if identical, false if not */
  async softCompare(other: SnapshotMeta): Promise<boolean> {
    const thisData = this.get();
    const otherData = other.get();
    const matches = [
      //# Version & path
      thisData.info.title === otherData.info.title,
      isDeepStrictEqual(thisData.info.license, otherData.info.license),
    ];
    return matches.every((match) => match === true);
  }
  /**
   * Make sure metas are identical copies.
   * @param other - The other meta.
   * @returns - true if identical, false if not
   */
  async stricCompare(other: SnapshotMeta): Promise<boolean> {
    //# Get Sha256 Comparisons rules
    const thisData = this.get();
    const otherData = other.get();
    const sha256Compares = Object.entries(thisData.sha256).map(([shaKey, thisSha]) => {
      const otherSha = other.editData.sha256[shaKey as keyof SnapshotMetaHashes];
      const identical = Boolean(thisSha) === Boolean(otherSha);
      if (identical && thisSha && otherSha) {
        //Is: Identical && not null(true)
        //-> trigger comparison
        const compare = Promise.all([
          this.validateDigest(this, shaKey as keyof SnapshotMetaHashes),
          this.validateDigest(other, shaKey as keyof SnapshotMetaHashes),
        ]).then(([thisValid, otherValid]) => {
          return thisValid && otherValid;
        });
        return compare;
      } else {
        //Is either: Not identical(false) : Identical && null (true)
        return identical;
      }
    });
    //# Compile all matches rules
    const matches = [
      //# Version & path
      thisData.path === otherData.path,
      thisData.info.version === otherData.info.version,
      //# config
      isDeepStrictEqual(thisData.config, otherData.config),
      //# sha256
      await Promise.race(sha256Compares),
    ];
    //# Return true if all matches rules are true
    return matches.every((match) => match === true);
  }
  /**
   * Save the meta to the snapshot path.
   * @returns - true if saved, false if failed
   */
  async commit() {
    this.submit();
  }
}
