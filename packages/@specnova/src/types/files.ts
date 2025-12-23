import { resolve } from 'path';
import { z } from 'zod';

const SAFE_PATH_REGEX =
  /^(?!.*(?:^|\/)\.(?:\/|$))(?!.*\.\.)[\/]?([A-Za-z0-9-_+@.]+\/)*([A-Za-z0-9-_+@.]+)$/;
const SAFE_FILE_REGEX = /^([A-z0-9-_+\.]+(.{0,7}))$/;

export function resolveRelativeSafePath(path: string) {
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

export const relativePathSchema = z.pipe(
  z.string().check(
    z.refine((val) => resolve(val)),
    z.refine((val) => {
      return SAFE_PATH_REGEX.test(val);
    }, 'Invalid relative path'),
    z.trim(),
  ),
  z.transform((val) => resolveRelativeSafePath(val)),
);

export type RelativePath = z.infer<typeof relativePathSchema>;

const baseFile = z.string().check(z.refine((val) => SAFE_FILE_REGEX.test(val), 'Invalid file'));

export const configFileExtensionSchema = z.enum(['config'] as const);
export const configFileSchema = z.pipe(
  baseFile.check(
    z.refine(
      (val) => configFileExtensionSchema.parse(val.split('.').pop() ?? ''),
      'Config file extension not accepted',
    ),
  ),
  z.transform((val) => resolveSafeFile(val)),
);

export type ConfigFile = z.infer<typeof configFileSchema>;
export type ConfigFileExtension = z.infer<typeof configFileExtensionSchema>;

export const snapshotFileExtension = z.enum(['yaml', 'yml', 'json', 'infer'] as const);
export const strictSnapshotFile = snapshotFileExtension.exclude(['infer']);
export const snapshotFile = z.pipe(
  baseFile.check(
    z.refine(
      (val) => snapshotFileExtension.parse(val.split('.').pop() ?? ''),
      'Snapshot file extension not accepted',
    ),
  ),
  z.transform((val) => resolveSafeFile(val)),
);

export type SnapshotFile = z.infer<typeof snapshotFile>;
export type StrictSnapshotFile = z.infer<typeof strictSnapshotFile>;
export type SnapshotFileExtension = z.infer<typeof snapshotFileExtension>;
