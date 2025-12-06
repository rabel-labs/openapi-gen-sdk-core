import { defaultOpenapiGenConfig } from '@/config/default';
import { OpenapiGenConfig } from '@/config/type';
import { mergeWithDefaults } from '@/config/utils';
import { openapiGenConfigName, OpenapiGenPlugin } from '@/plugins';

import { loadConfig } from 'c12';

import type { UserConfig } from '@hey-api/openapi-ts';

export type ResolvedOpenapiGenConfig = Omit<UserConfig, 'plugins'> & {
  openapiGenConfig: Required<OpenapiGenConfig>;
};

function isOpenApiGenPlugin(plugin: unknown): plugin is OpenapiGenPlugin['Config'] {
  return (
    typeof plugin === 'object' && plugin !== null && (plugin as any).name === openapiGenConfigName
  );
}

/**
 * Extract effective openapiGenConfig from UserConfig
 * and merge it with defaults safely.
 */
function resolveConfig(config: UserConfig): ResolvedOpenapiGenConfig {
  const { plugins, ...rest } = config;

  // Get config from plugin
  let pluginConfig: OpenapiGenConfig = {};
  plugins?.forEach((p) => {
    if (isOpenApiGenPlugin(p)) {
      pluginConfig = p.config;
    }
  });

  // Merge with default config
  const mergedOpenapiGenConfig = mergeWithDefaults(defaultOpenapiGenConfig, pluginConfig);
  return {
    ...rest,
    openapiGenConfig: mergedOpenapiGenConfig,
  };
}

const resolvedConfig = await loadConfig<UserConfig>({
  configFile: './openapi-ts.config',
}).then((res) => resolveConfig(res.config));

export default resolvedConfig;
