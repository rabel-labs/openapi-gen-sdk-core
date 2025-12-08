import resolvedConfig from '@/config';

import { readFileSync, writeFileSync } from 'fs';
import { resolve as path } from 'path';

export type SpecNovaInfo = {
  source: string;
  version: string;
  syncVersion?: boolean;
};

type PackageJson = {
  version: string;
  specnova: SpecNovaInfo;
  [key: string]: string | number | boolean | Object;
};

const config = resolvedConfig;

export class NpmPackage {
  static PKG_PATH = path(process.cwd(), 'package.json');
  private packageJson: PackageJson;

  static getPackage(): PackageJson {
    const text = readFileSync(NpmPackage.PKG_PATH, 'utf8');
    return JSON.parse(text) as PackageJson;
  }

  constructor() {
    this.packageJson = NpmPackage.getPackage();
  }

  editPackage(values: Partial<SpecNovaInfo>) {
    const pkg = this.packageJson;
    // Merge values
    pkg['specnova'] = {
      ...pkg['specnova'],
      ...values,
    };
    // Sync version
    if (config.syncVersion) {
      pkg.version = pkg['specnova'].version;
    }
    writeFileSync(NpmPackage.PKG_PATH, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    this.packageJson = pkg;
  }

  async getPackageOpenApi() {
    const pkg = this.packageJson;
    const { source, version } = pkg['specnova'] || {
      source: '',
      version: '',
    };

    return { version, source };
  }
}
