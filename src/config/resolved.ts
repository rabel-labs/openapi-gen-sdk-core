import { defaultOpenapiGenConfig } from '@/config/default';
import { OpenapiGenConfig } from '@/config/type';
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
 * Generic "defaults + overrides" merger that removes all undefined values
 */
export function mergeWithDefaults<T extends object>(
  defaults: Required<T>,
  overrides: Partial<T> | undefined,
): Required<T> {
  return Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => {
      const override = overrides?.[key as keyof T];
      return [key, override === undefined ? value : override];
    }),
  ) as Required<T>;
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
