import { fetchOpenApiSource } from '@/utils/fetch';
import { editPackage, getPackageOpenApi } from '@/utils/package';
import { parseOpenApiSpec } from '@/utils/parse';
import { createSnapshot } from '@/utils/snapshot';

async function extractAndParse(openApiSource: string) {
  const source = await fetchOpenApiSource(openApiSource);
  const openApi = parseOpenApiSpec(source);
  const apiVersion = openApi.info?.version;
  if (typeof apiVersion !== 'string') {
    throw new Error('❌ Could not find `info.version` in spec');
  }
  return { source, openApi, apiVersion };
}

export async function syncPatch() {
  const { source: pkgOpenApiSource } = await getPackageOpenApi();
  const { source, apiVersion } = await extractAndParse(pkgOpenApiSource);
  console.log(`🔀 Syncing patch for ${apiVersion}`);
  createSnapshot(source);
  console.log(`🔧 Synced patch to ${apiVersion}`);
}

export async function syncVersion() {
  const { version: pkgOpenApiVersion, source: pkgOpenApiSource } = await getPackageOpenApi();
  const { apiVersion } = await extractAndParse(pkgOpenApiSource);
  console.log(`🔀 Syncing version for ${pkgOpenApiVersion} → ${apiVersion}`);
  editPackage({ version: apiVersion });
  console.log(`🔧 Synced version to ${apiVersion}`);
}
