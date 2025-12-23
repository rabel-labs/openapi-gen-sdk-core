import { UserConfig } from '@/config';
import { ResolvedSpecnovaConfig } from '@/config/type';
import { hasNormalize } from '@/config/utils';
import converter from '@/core/converter';
import parserCommander from '@/core/parser';
import { parseSource } from '@/core/reference';
import { SnapshotMeta } from '@/core/snapshot/meta/base';
import { NpmPackage } from '@/npm/base';
import { SpecnovaSource } from '@/types';
import { relativePathSchema } from '@/types/files';

import { join as pathJoin } from 'path';

export class Snapshot {
  //# initialize
  private userConfig: Promise<UserConfig> = new UserConfig().load();
  private packageHandler: NpmPackage = new NpmPackage();
  private sourceUrl: string = '';

  //= OpenAPI source
  private specnovaSource: SpecnovaSource | null = null;
  //= Meta
  private meta: SnapshotMeta | null = null;

  //# clear cache
  private clearCache() {
    this.specnovaSource = null;
    this.meta = null;
    this.sourceUrl = '';
  }

  //# Getters
  //-> Config
  private async getFullConfig(): Promise<ResolvedSpecnovaConfig> {
    //= Appy user config to base config
    const userConfig = await Promise.resolve(this.userConfig);
    return userConfig.getConfig();
  }
  //-> User config
  private async getUserConfig(): Promise<UserConfig> {
    return await Promise.resolve(this.userConfig);
  }
  //-> Lazily compute and cache parsed OpenAPI source
  public async getSpecnovaSource() {
    if (this.specnovaSource) return this.specnovaSource;
    this.specnovaSource = await parseSource(this.sourceUrl);
    return this.specnovaSource;
  }

  //# Constructor
  constructor() {}

  //# Functions
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
  /**
   * Load from a source url.
   * @param source - The OpenAPI source.
   * @returns  - this
   */
  private async doLoad(source: string): Promise<this> {
    this.clearCache();
    const config = await this.getFullConfig();
    this.sourceUrl = source;
    const specnovaSource = await this.ensureSpecnovaSource();
    // Ccompute the snapshot path and create a new meta.
    let newMeta: SnapshotMeta;
    if (specnovaSource.isExternal) {
      // Create a fresh meta
      newMeta = new SnapshotMeta({ specnovaSource, config });
    } else {
      // Must be loaded using meta file
      throw new Error('Snapshot: specnova source must be loaded from a meta file');
    }
    // set the new meta
    this.meta = newMeta;
    return this;
  }
  /**
   * Load from a meta file
   * @param filePath - The meta path.
   * @returns - this
   */
  private async doLoadFromMeta(filePath: string) {
    this.clearCache();
    // -> load meta
    const newMeta = SnapshotMeta.fromFile(filePath);
    // -> load source
    const { path, files } = newMeta.get();
    const fullSourcePath = relativePathSchema.parse(pathJoin(path, files.names.source));
    this.sourceUrl = fullSourcePath;
    await this.ensureSpecnovaSource();
    this.meta = newMeta;
    return this;
  }
  /**
   * Load the spec branch from package.json
   *  Then, load the spec version.
   * @returns - this
   */
  async loadBranch(): Promise<this> {
    const specnovaPkg = await this.packageHandler.getPackageSpecnova();
    return await this.doLoadFromMeta(specnovaPkg.branch.target);
  }
  /**
   * Get the main spec version from package.json
   *  Then, load the spec version.
   * @returns - this
   */
  async loadSource(): Promise<this> {
    const { source } = await this.packageHandler.getPackageSpecnova();
    return await this.doLoad(source);
  }
  /**
   * Get a specific spec version snapshot folder.
   *  Then, load the spec version.
   * @param version - The spec version.
   * @returns - this
   */
  async loadVersion(version: string): Promise<this> {
    const config = await this.getFullConfig();
    const newMeta = SnapshotMeta.pull(version, config);
    const { path, files } = newMeta.get();
    const source = pathJoin(path, files.names.source);
    this.meta = newMeta;
    return this.doLoad(source);
  }
  /**
   * Prepare the source to be saved.
   * @returns - true if prepared, false if failed
   */
  async prepareSource(): Promise<boolean> {
    const specnovaSource = await this.ensureSpecnovaSource();
    const meta = this.ensureMeta();
    const { files } = meta.get();
    //# Extension check
    let extension = specnovaSource.extension;
    if (files.extensions.normalized !== 'infer') {
      extension = files.extensions.normalized;
    }
    //# Write source
    const sourceOutText = converter.fromApiDom(specnovaSource.parseResult, extension);
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
   * Perpare the normalized source to be saved.
   * @returns - true if prepared, false if failed
   */
  async prepareNormalized(): Promise<boolean> {
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
    //# Extension check
    let extension = specnovaSource.extension;
    if (files.extensions.normalized !== 'infer') {
      extension = files.extensions.normalized;
    }
    //# Write normalized
    const normalizedOutText = converter.fromApiDom(normalizedElement, extension);
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
   * Prepare all files to be saved.
   * @returns - { source, normalized }
   */
  async prepareAll() {
    return Promise.all([this.prepareSource(), this.prepareNormalized()]).then(
      ([source, normalized]) => {
        return { source, normalized };
      },
    );
  }
  /**
   * Commit changes to the snapshot folder.
   * @returns - true if saved, false if failed
   */
  async commit() {
    const meta = this.ensureMeta();
    return meta.commit();
  }
  /**
   * Prepare all & commit changes to the snapshot folder.
   * @returns - true if saved, false if failed
   * @default - sync all
   */
  async prepareAllAndCommit() {
    const result = await this.prepareAll();
    if (result.source && result.normalized) {
      return this.commit();
    }
  }
  /**
   * Set as the main spec version in package.json
   * @returns - true if saved, false if failed
   */
  async setMain() {
    const { path, files } = this.ensureMeta().get();
    const metaPath = pathJoin(path, files.names.meta);
    this.packageHandler.editPackage({
      branch: {
        target: metaPath,
      },
    });
    return true;
  }
  /**
   * Generate the selected snapshot to SDK.
   * @returns - true if generated, false if failed
   */
  async generate() {
    const userConfig = await this.getUserConfig();
    return await userConfig.generate();
  }
}
