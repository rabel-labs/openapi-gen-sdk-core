import { getResolvedConfig } from '@/config/resolved';
import converter from '@/core/converter';

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

export class NpmPackage {
  static PKG_PATH = path(process.cwd(), 'package.json');
  private packageJson: PackageJson;

  static getPackage(): PackageJson {
    const text = readFileSync(NpmPackage.PKG_PATH, 'utf8');
    return converter.fromText<PackageJson>(text, 'json');
  }

  constructor() {
    this.packageJson = NpmPackage.getPackage();
  }

  async editPackage(values: Partial<SpecNovaInfo>) {
    const config = await getResolvedConfig();
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
    writeFileSync(NpmPackage.PKG_PATH, converter.fromJson(pkg, true), 'utf8');
    this.packageJson = pkg;
  }

  async getPackageSpecnova() {
    const pkg = this.packageJson;
    const { source, version } = pkg['specnova'] || {
      source: '',
      version: '',
    };

    return { version, source };
  }
}
