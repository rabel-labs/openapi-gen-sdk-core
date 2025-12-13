import { HeyApiPlugin, heyApiPluginName } from '@/config/adapters/@hey-api/type';
import { BaseAdapterOptionsWithFile, FileAdapter } from '@/config/adapters/base';
import { UserConfig } from '@/config/base';
import { ResolvedSpecnovaConfig, SpecnovaConfig } from '@/config/type';
import { mergeWithDefaults } from '@/config/utils';

import { loadConfig } from 'c12';

import type { UserConfig } from '@hey-api/openapi-ts';

function isHeyApiPlugin(plugin: unknown): plugin is HeyApiPlugin['Config'] {
  return typeof plugin === 'object' && plugin !== null && (plugin as any).name === heyApiPluginName;
}

export class HeyApiAdapater extends FileAdapter {
  name: string = heyApiPluginName;
  filePath: string = 'openapi-ts.config';
  processor: typeof loadConfig<UserConfig> = loadConfig;
  constructor(options?: BaseAdapterOptionsWithFile) {
    super(options);
  }
  private findConfig(config: UserConfig): Partial<SpecnovaConfig> {
    const { plugins } = config;
    let pluginConfig: Partial<SpecnovaConfig> = {};
    plugins?.forEach((p) => {
      if (isHeyApiPlugin(p)) {
        pluginConfig = p.config;
      }
    });
    return pluginConfig;
  }
  async transform(externalConfig: ResolvedSpecnovaConfig): Promise<ResolvedSpecnovaConfig> {
    const resolvedConfig = await this.processor({
      cwd: UserConfig.getConfigRootDir(),
      configFile: this.filePath,
      packageJson: true,
    }).then((res) => {
      return this.findConfig(res.config);
    });
    return mergeWithDefaults(externalConfig, resolvedConfig);
  }
}
