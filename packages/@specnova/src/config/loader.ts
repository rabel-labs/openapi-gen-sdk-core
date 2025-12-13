import { UserConfigOptions } from '@/config/base';

import { loadConfig } from 'c12';

export type UserConfigLoader = typeof loadConfig<UserConfigOptions>;
export const UserConfigLoader = loadConfig<UserConfigOptions>;
