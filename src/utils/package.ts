import fs from 'fs';
import { PKG_PATH } from '@/utils/const';
import { OpenApiPackageInfo, PackageJson } from './type';

/**
 * Get the package.json file.
 * @returns {object} The package.json file.
 */
export function getPackage(): PackageJson {
  const text = fs.readFileSync(PKG_PATH, 'utf8');
  return JSON.parse(text);
}

/**
 * Extract package.json version & source
 * @returns {version, source} - The package.json version and source.
 */
export async function getPackageOpenApi() {
  const pkg = getPackage();
  const { source, version } = pkg['openapi'] || {
    source: '',
    version: '',
  };

  if (typeof source !== 'string') {
    throw new Error('❌ package.json `input` field must be a string (URL or local path)');
  }

  return { version, source };
}

/**
 * Edit the package.json file.
 * @param {object} values - The values to update.
 */
export function editPackage(values: Partial<OpenApiPackageInfo>) {
  const pkg = getPackage();

  // Merge values
  pkg['openapi'] = {
    ...pkg['openapi'],
    ...values,
  };

  // Sync version
  if (pkg['openapi']?.syncVersion) {
    pkg.version = pkg['openapi'].version;
  }

  fs.writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}
