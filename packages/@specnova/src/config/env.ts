import { mergeWithDefaults } from '@/config/utils';
import { configFileSchema, relativePathSchema } from '@/types/files';

import { loadDotenv } from 'c12';
import * as z from 'zod/mini';

const envConfigSchema = z.object({
  SPECNOVA_CONFIG_PATH: relativePathSchema,
  SPECNOVA_CONFIG_FILE: configFileSchema,
});

export type Env = z.infer<typeof envConfigSchema>;

const defaultEnv: Env = {
  SPECNOVA_CONFIG_PATH: process.cwd(),
  SPECNOVA_CONFIG_FILE: 'specnova.config',
};

let cachedEnv: Env | null = null;
export async function loadSafeEnvConfig(): Promise<Required<Env>> {
  if (cachedEnv) return cachedEnv;
  const loadedEnv = (await loadDotenv({
    fileName: [
      '.env',
      '.env.local',
      '.env.dev',
      '.env.prod',
      '.env.development',
      '.env.production',
    ],
  })) as Env;
  const env = mergeWithDefaults(defaultEnv, loadedEnv);
  const result = envConfigSchema.parse(env);
  cachedEnv = result;
  return result;
}
