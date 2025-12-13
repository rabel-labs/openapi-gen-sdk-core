import { UserConfig } from '@/config/base';
import { ResolvedSpecnovaConfig } from '@/config/type';

let resolvedConfig: ResolvedSpecnovaConfig | undefined;

export async function getResolvedConfig() {
  if (!resolvedConfig) {
    resolvedConfig = await (await new UserConfig().load()).getConfig();
  }
  return resolvedConfig;
}
