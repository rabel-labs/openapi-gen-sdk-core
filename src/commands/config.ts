import { loadConfig } from 'c12';
import type { UserConfig } from '@hey-api/openapi-ts';
import { defaultOpenapiGenConfig, openapiGenConfigName } from '@/plugins/config';
import { OpenapiGenPlugin } from '@/plugins';

type ResolvedOpenapiGenConfig = Omit<UserConfig, 'plugins'> & {
  openapiGenConfig: typeof defaultOpenapiGenConfig.config
};

function isOpenApiGenPlugin(plugin: any): plugin is OpenapiGenPlugin['Config'] {
  return typeof plugin !== 'string' && plugin.name === openapiGenConfigName;
}

const getConfig = (config: UserConfig) => {
  const { plugins, ...rest } = config;
  let openapiGenConfig: ResolvedOpenapiGenConfig['openapiGenConfig'] = defaultOpenapiGenConfig.config
  plugins?.find((plugin) => {
    if (isOpenApiGenPlugin(plugin)) {
      openapiGenConfig = plugin.config
    }
  });
  return {
    ...rest,
    openapiGenConfig
  };
};


const resolvedConfig = await loadConfig<UserConfig>({
  configFile: './openapi-ts.config',
}).then((res) => getConfig(res.config));

export default resolvedConfig as ResolvedOpenapiGenConfig;