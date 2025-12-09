import resolvedConfig from '@/config';
import { defaultOpenapiGenConfig } from '@/config/default';
import { OpenapiGenConfig } from '@/config/type';
import { hasNormalize, mergeWithDefaults } from '@/config/utils';
import converter from '@/core/converter';
import parserCommander from '@/core/parser';
import { parseSource } from '@/core/reference';
import { defaultSnapshotConfig, SnapshotConfig } from '@/core/snapshot/config';
import { SnapshotMeta } from '@/core/snapshot/meta/base';
import { NpmPackage } from '@/npm/base';
import { OpenApiSource } from '@/types';

import { mkdir, writeFile } from 'fs/promises';
import { join as pathJoin } from 'path';

export class Snapshot {
  //= initialize
  private packageHandler: NpmPackage = new NpmPackage();
  private readonly config: Required<OpenapiGenConfig> = resolvedConfig;
  private readonly snapshotConfig: Required<SnapshotConfig>;
  private sourceUrl: string = '';

  //= OpenAPI source
  private openapiSource: OpenApiSource | null = null;
  //= Meta
  private meta: SnapshotMeta | null = null;

  //# Constructor
  constructor(config?: OpenapiGenConfig) {
    //-> Apply config to default config
    this.config = mergeWithDefaults(defaultOpenapiGenConfig, config ?? this.config);
    //-> Apply snapshot config to default snapshot config
    this.snapshotConfig = mergeWithDefaults(defaultSnapshotConfig, this.config.snapshot);
  }

  //# Load & compute in order of dependency
  //-> 1. lazily compute and cache parsed OpenAPI source
  public async getOpenApiSource() {
    if (this.openapiSource) return this.openapiSource;
    this.openapiSource = await parseSource(this.sourceUrl);
    return this.openapiSource;
  }

  //-> Ensure getters
  private async ensureOpenApiSource(): Promise<OpenApiSource> {
    const openapiSource = await this.getOpenApiSource();
    if (!openapiSource) throw new Error('Snapshot: no OpenAPI source found');
    return openapiSource;
  }
  private async ensureMeta(): Promise<SnapshotMeta> {
    if (!this.meta) throw new Error('Snapshot: no meta found');
    return this.meta;
  }

  /*
   * Load the OpenAPI source and compute the snapshot path.
   * @returns - this
   */
  async load(source: string): Promise<this> {
    this.sourceUrl = source;
    const openapiSource = await this.ensureOpenApiSource();
    if (openapiSource.isExternal) {
      this.meta = new SnapshotMeta({ openapiSource, config: this.snapshotConfig });
    } else {
      this.meta = SnapshotMeta.pull(openapiSource.info, this.snapshotConfig);
    }
    return this;
  }

  /**
   * Load the main spec version from package.json
   * @returns - this
   */
  async loadMain(): Promise<this> {
    const { source } = await this.packageHandler.getPackageOpenApi();
    return this.load(source);
  }

  /**
   * Save the OpenAPI source to the snapshot path.
   * @returns - true if saved, false if failed
   */
  async saveSource(): Promise<boolean> {
    const openapiSource = await this.ensureOpenApiSource();
    const { path, files } = await this.ensureMeta();
    //# Get source file location
    const fullSourcePath = pathJoin(path, files.names.source);
    //# Write source
    const sourceOutText = converter.fromApiDom(openapiSource.parseResult, files.extensions.source);
    try {
      await mkdir(path, { recursive: true }); // Create directory
      writeFile(fullSourcePath, sourceOutText); // Write source
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
    const { path, files } = await this.ensureMeta();
    const fullNormalizedPath = pathJoin(path, files.names.normalized);
    //# Apply normalization
    const normalizedElement = parserCommander.byConfig(openapiSource.parseResult, this.config);
    //# Write normalized
    const normalizedOutText = converter.fromApiDom(normalizedElement, files.extensions.normalized);
    try {
      await mkdir(path, { recursive: true }); // Create directory
      writeFile(fullNormalizedPath, normalizedOutText);
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
  /**
   * Set as the main spec version in package.json
   * @returns - true if saved, false if failed
   */
  async setMain() {
    const { info, path, files } = await this.ensureMeta();
    const fullNormalizedPath = pathJoin(path, files.names.normalized);
    this.packageHandler.editPackage({
      source: fullNormalizedPath,
      version: info.version,
    });
    return true;
  }
}
