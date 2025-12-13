import { getResolvedConfig } from '@/config/resolved';
import { ResolvedSpecnovaConfig, SpecnovaConfig } from '@/config/type';
import { hasNormalize, mergeWithDefaults } from '@/config/utils';
import converter from '@/core/converter';
import parserCommander from '@/core/parser';
import { parseSource } from '@/core/reference';
import { SnapshotMeta } from '@/core/snapshot/meta/base';
import { NpmPackage } from '@/npm/base';
import { SpecnovaSource } from '@/types';

import { join as pathJoin } from 'path';

export class Snapshot {
  //= initialize
  private packageHandler: NpmPackage = new NpmPackage();
  private userConfig: ResolvedSpecnovaConfig | null = null;
  private readonly baseConfig: SpecnovaConfig = {};
  private sourceUrl: string = '';

  //= OpenAPI source
  private specnovaSource: SpecnovaSource | null = null;
  //= Meta
  private meta: SnapshotMeta | null = null;

  //= Config
  private async getFullConfig(): Promise<ResolvedSpecnovaConfig> {
    //= Appy user config to base config
    if (!this.userConfig) {
      this.userConfig = await getResolvedConfig();
    }
    return mergeWithDefaults(this.userConfig, this.baseConfig);
  }

  //# Constructor
  constructor(config?: SpecnovaConfig) {
    //= Apply config
    if (config) {
      this.baseConfig = config;
    }
  }
  //-> Lazily compute and cache parsed OpenAPI source
  public async getSpecnovaSource() {
    if (this.specnovaSource) return this.specnovaSource;
    this.specnovaSource = await parseSource(this.sourceUrl);
    return this.specnovaSource;
  }
  //-> Ensure data
  private async ensureSpecnovaSource(): Promise<SpecnovaSource> {
    const specnovaSource = await this.getSpecnovaSource();
    if (!specnovaSource) throw new Error('Snapshot: no OpenAPI source found');
    return specnovaSource;
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
    const config = await this.getFullConfig();
    this.sourceUrl = source;
    const specnovaSource = await this.ensureSpecnovaSource();
    const hasMeta = !!this.meta;
    // Ccompute the snapshot path and create a new meta.
    let newMeta: SnapshotMeta;
    if (specnovaSource.isExternal) {
      newMeta = new SnapshotMeta({ specnovaSource, config });
    } else {
      newMeta = SnapshotMeta.pull(specnovaSource.info.version, config);
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
    const { source } = await this.packageHandler.getPackageSpecnova();
    return this.load(source);
  }
  /**
   * Load a specific spec version snapshot folder.
   * @param version - The spec version.
   * @returns - this
   */
  async loadVersion(version: string): Promise<this> {
    const config = await this.getFullConfig();
    const newMeta = SnapshotMeta.pull(version, config);
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
    const specnovaSource = await this.ensureSpecnovaSource();
    const meta = this.ensureMeta();
    const { files } = meta.get();
    //# Write source
    const sourceOutText = converter.fromApiDom(specnovaSource.parseResult, files.extensions.source);
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
    const config = await this.getFullConfig();
    //# Check if normalization is needed
    if (!hasNormalize(config)) {
      console.log('✅ No normalization settings found');
      return true;
    }
    //# Get normalized file location
    const specnovaSource = await this.ensureSpecnovaSource();
    const meta = this.ensureMeta();
    const { files } = meta.get();
    //# Apply normalization
    const normalizedElement = parserCommander.byConfig(specnovaSource.parseResult, config);
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
