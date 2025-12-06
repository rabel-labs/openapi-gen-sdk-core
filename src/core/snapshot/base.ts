import { defaultOpenapiGenConfig } from '@/config/default';
import { OpenapiGenConfig } from '@/config/type';
import { hasNormalize, mergeWithDefaults } from '@/config/utils';
import converter from '@/core/converter';
import { infoExtracter } from '@/core/extracter';
import { Info } from '@/core/extracter/info/type';
import parserCommander from '@/core/parser';
import { parseSource } from '@/core/reference';
import {
  defaultSnapshotConfig,
  SnapshotConfig,
  SnapshotFileExtension,
} from '@/core/snapshot/config';
import { OpenApiSource } from '@/types';

import { mkdir, writeFile } from 'fs/promises';
import { join as pathJoin } from 'path';

export class Snapshot {
  //= initialize
  private readonly config: Required<OpenapiGenConfig>;
  private readonly snapshotConfig: Required<SnapshotConfig>;
  private readonly sourceUrl: string;

  //= Load & compute
  private openapiSource: OpenApiSource | null = null;
  private openapiInfo: Info | null = null;
  private path: string | null = null;
  private fileNames: SnapshotConfig['files'] | null = null;
  private fileExtensions: {
    source: SnapshotFileExtension;
    normalized: SnapshotFileExtension;
    meta: SnapshotFileExtension;
  } | null = null;

  //# Constructor
  constructor(source: string, config?: OpenapiGenConfig) {
    this.config = mergeWithDefaults(defaultOpenapiGenConfig, config);
    this.snapshotConfig = mergeWithDefaults(defaultSnapshotConfig, this.config.snapshot);
    this.sourceUrl = source;
  }

  //# Load & compute in order of dependency
  //-> 1. lazily compute and cache parsed OpenAPI source
  private async getOpenApiSource() {
    if (this.openapiSource) return this.openapiSource;
    this.openapiSource = await parseSource(this.sourceUrl);
    return this.openapiSource;
  }
  //-> 2. lazily compute and cache extracted Info
  private getOpenApiInfo() {
    if (this.openapiInfo) return this.openapiInfo;
    if (!this.openapiSource) return null;
    this.openapiInfo = infoExtracter.extract(this.openapiSource.parseResult);
    return this.openapiInfo;
  }
  //-> 3. lazily compute and cache output path
  private getPath() {
    if (this.path) return this.path;
    const info = this.getOpenApiInfo();
    if (!info) return null;
    const rootDir =
      typeof this.snapshotConfig.folder === 'string'
        ? this.snapshotConfig.folder
        : this.snapshotConfig.folder.root;
    this.path = `${rootDir}/${info.version}`;
    return this.path;
  }
  //-> 4. lazily compute and cache file names
  private getFilesInfo() {
    if (this.fileNames) return this.fileNames;
    this.fileNames = {
      source: `${this.snapshotConfig.files.source}`,
      normalized: `${this.snapshotConfig.files.normalized}`,
      meta: `${this.snapshotConfig.files.meta}`,
    };
    return this.fileNames;
  }
  //-> 5. lazily compute and cache values file extensions
  private getFileExtensions() {
    if (this.fileExtensions) return this.fileExtensions;
    let sourceExtension: SnapshotFileExtension;
    switch (this.snapshotConfig.extensions.source) {
      case 'json':
        sourceExtension = 'json';
        break;
      case 'yaml':
        sourceExtension = 'yaml';
        break;
      case 'infer':
      default:
        sourceExtension = this.openapiSource!.extension;
    }
    let normalizedExtension: SnapshotFileExtension;
    switch (this.snapshotConfig.extensions.normalized) {
      case 'yaml':
        normalizedExtension = 'yaml';
        break;
      case 'infer':
        normalizedExtension = this.openapiSource!.extension;
      case 'json':
      default:
        normalizedExtension = 'json';
        break;
    }
    let metaExtension = this.snapshotConfig.extensions.meta;
    this.fileExtensions = {
      source: sourceExtension,
      normalized: normalizedExtension,
      meta: metaExtension,
    };
    return this.fileExtensions;
  }

  //-> Precompute and cache values for later use.
  private compute() {
    this.openapiInfo = this.getOpenApiInfo();
    this.path = this.getPath();
    this.fileNames = this.getFilesInfo();
    this.fileExtensions = this.getFileExtensions();
    return {
      openapiInfo: this.openapiInfo,
      path: this.path,
      fileNames: this.fileNames,
      fileExtensions: this.fileExtensions,
    };
  }

  //-> Ensure getters
  private async ensureOpenApiSource(): Promise<OpenApiSource> {
    const openapiSource = await this.getOpenApiSource();
    if (!openapiSource) throw new Error('Snapshot: no OpenAPI source found');
    return openapiSource;
  }
  private ensureComputed() {
    const { openapiInfo, path, fileNames, fileExtensions } = this.compute();
    if (openapiInfo && path && fileNames && fileExtensions)
      return { openapiInfo, path, fileNames, fileExtensions };
    throw new Error('Snapshot: no OpenAPI source found');
  }
  /*
   * Load the OpenAPI source and compute the snapshot path.
   * @returns - this
   */
  async load(): Promise<this> {
    this.ensureOpenApiSource();
    this.ensureComputed();
    return this;
  }

  /**
   * Save the OpenAPI source to the snapshot path.
   * @returns - true if saved, false if failed
   */
  async saveSource(): Promise<boolean> {
    const openapiSource = await this.ensureOpenApiSource();
    const { path, fileNames, fileExtensions } = this.ensureComputed();
    //# Get source file location
    const fullFileName = `${fileNames.source}.${fileExtensions.source}`;
    const fullSourcePath = pathJoin(path, fullFileName);
    //# Write source
    const sourceOutText = converter.fromApiDom(openapiSource.parseResult, fileExtensions.source);
    try {
      mkdir(path, { recursive: true });
      writeFile(fullSourcePath, sourceOutText, 'utf-8');
      console.log(`✅ Saved source to ${fullSourcePath}`);
      return true;
    } catch (e) {
      console.error('❌ Failed to save source', e);
      return false;
    }
  }
  /**
   * Save the OpenAPI normalized source to the snapshot path.
   * @returns - true if saved, false if failed
   */
  async saveNormalized(): Promise<boolean> {
    //# Check if normalization is needed
    if (!hasNormalize(this.config)) {
      console.log('✅ No normalization settings found');
      return true;
    }
    //# Get normalized file location
    const openapiSource = await this.ensureOpenApiSource();
    const { path, fileNames, fileExtensions } = this.ensureComputed();
    const fullFileNames = `${fileNames.normalized}.${fileExtensions.normalized}`;
    const fullNormalizedPath = pathJoin(path, fullFileNames);
    //# Apply normalization
    const normalizedElement = parserCommander.byConfig(openapiSource.parseResult, this.config);
    //# Write normalized
    const normalizedOutText = converter.fromApiDom(normalizedElement, fileExtensions.normalized);
    try {
      mkdir(path, { recursive: true });
      writeFile(fullNormalizedPath, normalizedOutText, 'utf-8');
      console.log(`✅ Saved normalized to ${fullNormalizedPath}`);
      return true;
    } catch (e) {
      console.error('❌ Failed to save normalized', e);
      return false;
    }
  }
  /**
   * Save all files.
   * @returns - true if saved, false if failed
   */
  async saveAll() {
    return Promise.all([this.saveSource(), this.saveNormalized()]).then(([source, normalized]) => {
      return { source, normalized };
    });
  }
}
