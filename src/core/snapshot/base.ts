import resolvedConfig from '@/config';
import { defaultOpenapiGenConfig } from '@/config/default';
import { OpenapiGenConfig, ResolvedOpenapiGenConfig } from '@/config/type';
import { hasNormalize, mergeWithDefaults } from '@/config/utils';
import converter from '@/core/converter';
import parserCommander from '@/core/parser';
import { parseSource } from '@/core/reference';
import { defaultSnapshotConfig, SnapshotConfig } from '@/core/snapshot/config';
import { SnapshotMeta } from '@/core/snapshot/meta/base';
import { NpmPackage } from '@/npm/base';
import { OpenApiSource } from '@/types';

import { join as pathJoin } from 'path';

export class Snapshot {
  //= initialize
  private packageHandler: NpmPackage = new NpmPackage();
  private readonly config: ResolvedOpenapiGenConfig = resolvedConfig;
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
  //-> Lazily compute and cache parsed OpenAPI source
  public async getOpenApiSource() {
    if (this.openapiSource) return this.openapiSource;
    this.openapiSource = await parseSource(this.sourceUrl);
    return this.openapiSource;
  }
  //-> Ensure data
  private async ensureOpenApiSource(): Promise<OpenApiSource> {
    const openapiSource = await this.getOpenApiSource();
    if (!openapiSource) throw new Error('Snapshot: no OpenAPI source found');
    return openapiSource;
  }
  private ensureMeta(): SnapshotMeta {
    if (!this.meta) throw new Error('Snapshot: no meta found');
    //!TODO: Validate meta
    return this.meta;
  }
  /*
   * Load the OpenAPI source;
   * if meta is found, load the meta;
   * otherwise, compute the snapshot path and create a new meta.
   * @returns - this
   */
  async load(source: string): Promise<this> {
    this.sourceUrl = source;
    const openapiSource = await this.ensureOpenApiSource();
    const hasMeta = this.meta ? true : false;
    // Ccompute the snapshot path and create a new meta.
    let newMeta: SnapshotMeta;
    if (openapiSource.isExternal) {
      newMeta = new SnapshotMeta({ openapiSource, config: this.snapshotConfig });
    } else {
      newMeta = SnapshotMeta.pull(openapiSource.info.version, this.snapshotConfig);
    }
    // If already hase a meta
    if (!hasMeta) {
      // Compare validity to the new meta
      const isValid = hasMeta ? await this.meta?.softCompare(newMeta) : true;
      // Set the new meta
      this.meta = isValid ? newMeta : this.meta;
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
   * Load a specific spec version snapshot folder.
   * @param version - The spec version.
   * @returns - this
   */
  async loadVersion(version: string): Promise<this> {
    const newMeta = await SnapshotMeta.pull(version, this.snapshotConfig);
    const { path, files } = newMeta.get();
    const source = pathJoin(path, files.names.source);
    this.meta = newMeta;
    return this.load(source);
  }
  /**
   * Save the OpenAPI source to the snapshot path.
   * @returns - true if saved, false if failed
   */
  async saveSource(): Promise<boolean> {
    const openapiSource = await this.ensureOpenApiSource();
    const meta = this.ensureMeta();
    const { files } = meta.get();
    //# Write source
    const sourceOutText = converter.fromApiDom(openapiSource.parseResult, files.extensions.source);
    try {
      meta.addDocument({
        source: sourceOutText,
      });
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
    const meta = this.ensureMeta();
    const { files } = meta.get();
    //# Apply normalization
    const normalizedElement = parserCommander.byConfig(openapiSource.parseResult, this.config);
    //# Write normalized
    const normalizedOutText = converter.fromApiDom(normalizedElement, files.extensions.normalized);
    try {
      meta.addDocument({
        normalized: normalizedOutText,
      });
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
   * Commit
   * @returns - true if saved, false if failed
   */
  async commit() {
    const meta = this.ensureMeta();
    return meta.commit();
  }
  /**
   * Save all & commit
   * @returns - true if saved, false if failed
   * @default - sync all
   */
  async saveAllAndCommit() {
    const result = await Promise.all([this.saveSource(), this.saveNormalized()]).then(
      ([source, normalized]) => {
        return { source, normalized };
      },
    );
    if (result.source && result.normalized) {
      return this.commit();
    }
  }
  /**
   * Set as the main spec version in package.json
   * @returns - true if saved, false if failed
   */
  async setMain() {
    const { info, path, files } = this.ensureMeta().get();
    const fullNormalizedPath = pathJoin(path, files.names.normalized);
    this.packageHandler.editPackage({
      source: fullNormalizedPath,
      version: info.version,
    });
    return true;
  }
}
