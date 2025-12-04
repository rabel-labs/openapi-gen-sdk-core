import { parseSource } from '@/core';
import { infoExtracter } from '@/core/extracter';
import { OpenApiSource } from '@/types/type';
import { SNAPSHOTS_DIR } from '@/utils/const';
import { getPackageOpenApi } from '@/utils/package';

import { mkdirSync, writeFileSync } from 'fs';
import { basename as pathBasename, join as pathJoin } from 'path';

import { toJSON, toYAML } from '@swagger-api/apidom-core';

/**
 * Write a snapshot file for a given OpenAPI spec content.
 * @param {object} params
 * @param {string} params.text - JSON or YAML
 * @param {string} params.pathname - The base path or file name
 * @param {string} params.extension - File extension, ".json" or ".yaml".
 */
export function createSnapshot(openApiSource: OpenApiSource) {
  const { parseResult, source, extension } = openApiSource;
  const info = infoExtracter.extract(parseResult);
  const apiVersion = info.version;
  if (typeof apiVersion !== 'string') {
    throw new Error('Cannot write snapshot: spec.info.version is not a string');
  }

  // # Write
  //- Determine base filename
  const baseName = pathBasename(source, extension);
  mkdirSync(SNAPSHOTS_DIR, { recursive: true });

  const outFilename = `${baseName}.${apiVersion}${extension}`;
  const outPath = pathJoin(SNAPSHOTS_DIR, outFilename);

  //- Stringify
  const outText = extension === '.json' ? toJSON(parseResult) : toYAML(parseResult);

  // # Write
  writeFileSync(outPath, outText, 'utf-8');

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

  const { source, extension } = await parseSource(pkgOpenApiSource);
  const baseName = pathBasename(source, extension);

  const outFilename = `${baseName}.${apiVersion}${extension}`;
  return pathJoin(SNAPSHOTS_DIR, outFilename);
}
