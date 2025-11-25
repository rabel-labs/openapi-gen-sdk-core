import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { parseOpenApiSpec } from '@/utils/parse';
import { SNAPSHOTS_DIR } from '@/utils/const';
import { getPackageOpenApi } from '@/utils/package';
import { fetchOpenApiSource } from '@/utils/fetch';
import { OpenApiSource } from '../type';

/**
 * Write a snapshot file for a given OpenAPI spec content.
 * @param {object} params
 * @param {string} params.text - JSON or YAML
 * @param {string} params.pathname - The base path or file name
 * @param {string} params.extension - File extension, ".json" or ".yaml".
 */
export function createSnapshot(source: OpenApiSource) {
  //# Parse
  const { pathname, extension } = source;
  const spec = parseOpenApiSpec(source);
  const apiVersion = spec.info?.version;
  if (typeof apiVersion !== 'string') {
    throw new Error('Cannot write snapshot: spec.info.version is not a string');
  }

  // # Write
  //- Determine base filename
  const baseName = path.basename(pathname, extension);
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });

  const outFilename = `${baseName}.${apiVersion}${extension}`;
  const outPath = path.join(SNAPSHOTS_DIR, outFilename);

  //- Stringify
  const outText = extension === '.json' ? JSON.stringify(spec, null, 2) : YAML.stringify(spec);

  // # Write
  fs.writeFileSync(outPath, outText, 'utf-8');

  console.log(`✅ Wrote ${outPath}`);

  return { outPath, apiVersion };
}

/**
 * Get pathname to snapshot file.
 * @param {string} [version] - The API version.
 */
export async function getSnapshotPath(version = null) {
  const { version: pkgOpenApiVersion, source: pkgOpenApiSource } = await getPackageOpenApi();

  if (typeof pkgOpenApiSource !== 'string') {
    console.error('❌ package.json `input` field must be a string (URL or local path)');
    process.exit(1);
  }

  const apiVersion = version || pkgOpenApiVersion;
  if (!apiVersion) {
    throw new Error('❌ Cannot get patch file path: no API version found');
  }

  const { pathname, extension } = await fetchOpenApiSource(pkgOpenApiSource);
  const baseName = path.basename(pathname, extension);

  const outFilename = `${baseName}.${apiVersion}${extension}`;
  return path.join(SNAPSHOTS_DIR, outFilename);
}
