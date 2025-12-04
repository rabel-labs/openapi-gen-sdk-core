import { parseSource } from '@/core';
import { infoExtracter } from '@/core/extracter';
import { editPackage, getPackageOpenApi } from '@/utils/package';
import { createSnapshot } from '@/utils/snapshot';

import { execSync } from 'child_process';

export async function ciCheck() {
  const { version: pkgOpenApiVersion, source: pkgOpenApiSource } = await getPackageOpenApi();
  const { parseResult } = await parseSource(pkgOpenApiSource);
  const externalVersion = infoExtracter.extract(parseResult).version;
  if (pkgOpenApiVersion === externalVersion) {
    console.log('✅ Local patch is up to date.');
    return false;
  }
  console.log(`🚨 Update available: ${pkgOpenApiVersion} → ${externalVersion}`);
  return true;
}

export async function ciUpdate() {
  const { source: pkgOpenApiSource } = await getPackageOpenApi();
  const openApiSource = await parseSource(pkgOpenApiSource);
  const version = infoExtracter.extract(openApiSource.parseResult).version;
  editPackage({ version });
  createSnapshot(openApiSource);
  return version;
}

export async function ciGenerate() {
  console.log('📦 Generating SDK with `pnpm run gen`...');
  execSync('pnpm run gen', { stdio: 'inherit' });
  console.log('✅ SDK generation complete.');
}
