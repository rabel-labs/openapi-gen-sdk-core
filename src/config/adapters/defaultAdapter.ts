import { BaseAdapter, BaseAdapterOptionsWithFile, FileAdapter } from '@/config/adapters/base';
import { Config } from '@/config/base';
import { OpenapiGenConfig } from '@/config/type';
import { mergeWithDefaults } from '@/config/utils';

import { loadConfig } from 'c12';
export const defaultAdapterName = 'default';

type ConfigOptions = {
  adapter?: BaseAdapter;
  config?: OpenapiGenConfig;
};

export function defineConfig(ConfigOptions: ConfigOptions): ConfigOptions {
  return ConfigOptions;
}

export class DefaultAdapter extends FileAdapter {
  name: string = defaultAdapterName;
  processor: typeof loadConfig<OpenapiGenConfig> = loadConfig;
  constructor(options?: BaseAdapterOptionsWithFile) {
    super(options);
  }
  async transform(externalConfig: Required<OpenapiGenConfig>) {
    const resolvedConfig = await loadConfig<ConfigOptions>({
      cwd: Config.getConfigRootDir(),
      configFile: externalConfig.configFile,
      packageJson: true,
    });
    //-> Check adapter
    let modifiedExternalConfig = externalConfig;
    if (
      resolvedConfig.config.adapter !== undefined &&
      typeof resolvedConfig.config.adapter.name !== this.name
    ) {
      //-> load that adapter on top of default
      let adapterResult = await resolvedConfig.config.adapter.transform(externalConfig);
      modifiedExternalConfig = mergeWithDefaults(modifiedExternalConfig, adapterResult);
    }
    //-> apply default config
    return mergeWithDefaults(modifiedExternalConfig, resolvedConfig.config.config ?? {});
  }
}
