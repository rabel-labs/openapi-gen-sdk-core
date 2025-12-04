import { parseSource } from '@/core';
import { infoExtracter } from '@/core/extracter';
import { editPackage, getPackageOpenApi } from '@/utils/package';
import { createSnapshot } from '@/utils/snapshot';

export async function syncPatch() {
  const { source: pkgOpenApiSource } = await getPackageOpenApi();
  const openapiSource = await parseSource(pkgOpenApiSource);
  const { version } = infoExtracter.extract(openapiSource.parseResult);
  console.log(`🔀 Syncing patch for ${version}`);
  createSnapshot(openapiSource);
  console.log(`🔧 Synced patch to ${version}`);
}

export async function syncVersion() {
  const { version: pkgOpenApiVersion, source: pkgOpenApiSource } = await getPackageOpenApi();
  const openapiSource = await parseSource(pkgOpenApiSource);
  const { version } = infoExtracter.extract(openapiSource.parseResult);
  console.log(`🔀 Syncing version for ${pkgOpenApiVersion} → ${version}`);
  editPackage({ version: version });
  console.log(`🔧 Synced version to ${version}`);
}
