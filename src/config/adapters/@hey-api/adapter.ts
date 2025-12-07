import { HeyApiPlugin, heyApiPluginName } from '@/config/adapters/@hey-api/type';
import { BaseAdapterOptionsWithFile, FileAdapter } from '@/config/adapters/base';
import { Config } from '@/config/base';
import { OpenapiGenConfig, ResolvedOpenapiGenConfig } from '@/config/type';
import { mergeWithDefaults } from '@/config/utils';

import { loadConfig } from 'c12';

import type { UserConfig } from '@hey-api/openapi-ts';

function isOpenApiGenPlugin(plugin: unknown): plugin is HeyApiPlugin['Config'] {
  return typeof plugin === 'object' && plugin !== null && (plugin as any).name === heyApiPluginName;
}

export class HeyApiAdapater extends FileAdapter {
  name: string = heyApiPluginName;
  filePath: string = 'openapi-ts.config';
  processor: typeof loadConfig<UserConfig> = loadConfig;
  constructor(options?: BaseAdapterOptionsWithFile) {
    super(options);
  }
  private findConfig(config: UserConfig): Partial<OpenapiGenConfig> {
    const { plugins } = config;
    let pluginConfig: Partial<OpenapiGenConfig> = {};
    plugins?.forEach((p) => {
      if (isOpenApiGenPlugin(p)) {
        pluginConfig = p.config;
      }
    });
    return pluginConfig;
  }
  async transform(externalConfig: ResolvedOpenapiGenConfig): Promise<ResolvedOpenapiGenConfig> {
    const resolvedConfig = await this.processor({
      cwd: Config.getConfigRootDir(),
      configFile: this.filePath,
      packageJson: true,
    }).then((res) => {
      return this.findConfig(res.config);
    });
    return mergeWithDefaults(externalConfig, resolvedConfig);
  }
}
