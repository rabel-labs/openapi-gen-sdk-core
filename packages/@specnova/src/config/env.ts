import { mergeWithDefaults } from '@/config/utils';

import { loadDotenv } from 'c12';
import { resolve } from 'path';
import * as z from 'zod/mini';

const SAFE_RELATIVE_PATH_REGEX = /^[\/]?([A-z0-9-_+@]+\/)*([A-z0-9-_+@]+([A-z0-9-_+@]))$/;
const SAFE_FILE_REGEX = /^([A-z0-9-_+\.]+(.{7}))$/;
const ACCEPTED_FILE_EXTENSIONS = ['config'];

function resolveSafePath(path: string) {
  const localPath = resolve(process.cwd());
  const resolved = resolve(localPath, path);
  if (!resolved.startsWith(localPath)) {
    throw new Error(`Invalid config path: ${resolved}`);
  }
  return resolved;
}

function resolveSafeFile(file: string) {
  const resolved = resolve(file);
  // resolve then cut (Ensure user input safety)
  const fileName = resolved.split('/').pop();
  if (!fileName) {
    throw new Error(`Invalid file: ${resolved}`);
  }
  return fileName;
}

const zodFilePath = z.pipe(
  z.string().check(
    z.refine((val) => {
      return SAFE_RELATIVE_PATH_REGEX.test(val);
    }, 'Invalid path'),
    z.trim(),
  ),
  z.transform((val) => resolveSafePath(val)),
);

const zodFile = z.pipe(
  z.string().check(
    z.trim(),
    z.refine((val) => SAFE_FILE_REGEX.test(val), 'Invalid file'),
    z.refine(
      (val) => ACCEPTED_FILE_EXTENSIONS.includes(val.split('.').pop() ?? ''),
      'Extension not accepted',
    ),
    z.trim(),
  ),
  z.transform((val) => resolveSafeFile(val)),
);

const envConfigSchema = z.object({
  SPECNOVA_CONFIG_PATH: zodFilePath,
  SPECNOVA_CONFIG_FILE: zodFile,
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
