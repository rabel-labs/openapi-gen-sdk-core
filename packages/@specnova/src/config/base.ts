import { BaseAdapter } from '@/config/adapters/base';
import { DefaultAdapter } from '@/config/adapters/defaultAdapter';
import { defaultSpecnovaGenConfig } from '@/config/default';
import { loadEnvConfig } from '@/config/env';
import { ResolvedSpecnovaConfig, SpecnovaConfig } from '@/config/type';
import { mergeWithDefaults } from '@/config/utils';

type Adapter = BaseAdapter;

type ConfigOptions = {
  adapter?: Adapter;
  config?: Partial<SpecnovaConfig>;
};

export class Config {
  private isLoaded = false;
  private adapter: Adapter;
  private resolved: Promise<ResolvedSpecnovaConfig> | ResolvedSpecnovaConfig;

  //-> Static Helpers
  static getConfigRootDir(subPath?: string): string {
    const path = subPath ? subPath : process.env.SPECNOVA_CONFIG_PATH;
    return `${process.cwd()}${path ? `/${path}` : ''}`;
  }

  private static async loadEnvConfig() {
    await loadEnvConfig();
  }

  constructor(options?: ConfigOptions) {
    this.adapter = options?.adapter ?? new DefaultAdapter();
    this.resolved = mergeWithDefaults(defaultSpecnovaGenConfig, options?.config ?? {});
  }
  /**
   * Load config from adapters.
   * @returns - SpecnovaGenConfig
   */
  private async applyAdapter() {
    const adapter = this.adapter;
    if (!adapter) {
      return;
    }
    const transformer = await adapter.transform(await Promise.resolve(this.resolved));
    this.resolved = transformer;
  }
  /**
   * Load config from adapters.
   * @returns - SpecnovaGenConfig
   */
  public async load() {
    // load env config first & apply adapter
    await Config.loadEnvConfig();
    await this.applyAdapter();
    this.isLoaded = true;
    return this;
  }
  /**
   * Get resolved config.
   * @returns - SpecnovaGenConfig
   */
  async getConfig(): Promise<ResolvedSpecnovaConfig> {
    if (!this.isLoaded) throw new Error('Config: config is not loaded');
    return await Promise.resolve(this.resolved);
  }
}
