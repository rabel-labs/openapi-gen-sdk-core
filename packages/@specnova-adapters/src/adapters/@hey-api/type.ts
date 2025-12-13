import { SpecnovaConfig } from '@/config/type';

import type { DefinePlugin } from '@hey-api/openapi-ts';

export const heyApiPluginName = '@specnova' as const;
export type HeyApiUserConfig = {
  name: typeof heyApiPluginName;
} & Partial<SpecnovaConfig>;

export type HeyApiPlugin = DefinePlugin<HeyApiUserConfig>;
