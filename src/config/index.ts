import { Config } from '@/config/base';

export const ResolvedConfig = await new Config().load();
const resolvedConfig = await ResolvedConfig.getConfig();

export default resolvedConfig;
