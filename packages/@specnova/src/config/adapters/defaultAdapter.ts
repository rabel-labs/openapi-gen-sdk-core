import { BaseAdapterOptionsWithFile, FileAdapter } from '@/config/adapters/base';
import { UserConfig, UserConfigOptions } from '@/config/base';
import { UserConfigLoader } from '@/config/loader';
import { ResolvedSpecnovaConfig } from '@/config/type';
import { mergeWithDefaults } from '@/config/utils';

export const defaultAdapterName = 'default';

export function defineConfig(ConfigOptions: UserConfigOptions): UserConfigOptions {
  return ConfigOptions;
}

export class DefaultAdapter extends FileAdapter {
  name: string = defaultAdapterName;
  processor: typeof UserConfigLoader = UserConfigLoader;
  constructor(options?: BaseAdapterOptionsWithFile) {
    super(options);
  }
  async transform(externalConfig: ResolvedSpecnovaConfig) {
    const resolvedConfig = await UserConfigLoader({
      cwd: UserConfig.getConfigRootDir(),
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
    const finalConfig = mergeWithDefaults(
      modifiedExternalConfig,
      resolvedConfig.config.config ?? {},
    );
    return finalConfig;
  }
}
