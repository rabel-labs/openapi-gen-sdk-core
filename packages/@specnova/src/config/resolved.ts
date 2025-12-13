import { Config } from '@/config/base';
import { ResolvedSpecnovaConfig } from '@/config/type';

let resolvedConfig: ResolvedSpecnovaConfig | undefined;

export async function getResolvedConfig() {
  if (!resolvedConfig) {
    resolvedConfig = await (await new Config().load()).getConfig();
  }
  return resolvedConfig;
}
