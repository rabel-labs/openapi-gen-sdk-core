import { fetchOpenApiSource } from '@/utils/fetch';
import { editPackage, getPackageOpenApi } from '@/utils/package';
import { getOpenApiVersion } from '@/utils/parse';
import { createSnapshot } from '@/utils/snapshot';
import { execSync } from 'child_process';

export async function ciCheck() {
  const { version: pkgOpenApiVersion, source: pkgOpenApiSource } = await getPackageOpenApi();

  const source = await fetchOpenApiSource(pkgOpenApiSource);
  const externalVersion = getOpenApiVersion(source);

  if (pkgOpenApiVersion === externalVersion) {
    console.log('✅ Local patch is up to date.');
    return false;
  }

  //GitHub Actions Variable
  console.log(`🚨 Update available: ${pkgOpenApiVersion} → ${externalVersion}`);
  return true;
}

export async function ciUpdate() {
  const { source: pkgOpenApiSource } = await getPackageOpenApi();

  const source = await fetchOpenApiSource(pkgOpenApiSource);
  const version = getOpenApiVersion(source);

  editPackage({ version });
  createSnapshot(source);

  return version;
}

export async function ciGenerate() {
  console.log('📦 Generating SDK with `pnpm run gen`...');

  execSync('pnpm run gen', { stdio: 'inherit' });

  console.log('✅ SDK generation complete.');
}
