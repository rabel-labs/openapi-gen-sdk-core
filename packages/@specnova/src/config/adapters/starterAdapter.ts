import { FileAdapter } from '@/config/adapters/base';
import { UserConfig, UserConfigOptions } from '@/config/base';
import { ResolvedSpecnovaConfig } from '@/config/type';
import { mergeWithDefaults } from '@/config/utils';

export const defaultAdapterName = 'default';

export function defineConfig(ConfigOptions: UserConfigOptions): UserConfigOptions {
  return ConfigOptions;
}

/**
 * Starter Adapter
 * This adapter is used to load the default config.
 * It will load the default config and apply the adapter if present.
 */
export class StarterAdapter extends FileAdapter<UserConfig> {
  name = defaultAdapterName;
  constructor() {
    super();
  }
  async transform(externalConfig: ResolvedSpecnovaConfig) {
    const loadedConfig = await this.load();
    //-> Check adapter
    let modifiedExternalConfig = externalConfig;
    if (loadedConfig.adapter !== undefined && typeof loadedConfig.adapter.name !== this.name) {
      console.log('adapter', loadedConfig.adapter.name);
      //-> load that adapter on top of default
      let adapterResult = await loadedConfig.adapter.transform(externalConfig);
      modifiedExternalConfig = mergeWithDefaults(modifiedExternalConfig, adapterResult);
    }
    //-> Check if config is present
    let currentConfig;
    if (loadedConfig?.getConfig) {
      currentConfig = await loadedConfig.getConfig();
    }
    //-> apply default config
    const finalConfig = mergeWithDefaults(modifiedExternalConfig, currentConfig);
    return finalConfig;
  }
  async generate() {
    throw new Error('Adapter: generate is not implemented');
  }
}
