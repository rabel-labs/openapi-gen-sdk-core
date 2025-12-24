import converter from '@/core/converter';
import { Semver } from '@/types/semver';

import { readFileSync, writeFileSync } from 'fs';
import { resolve as path } from 'path';
import { z } from 'zod/mini';

const specNovaPackageSchema = z.object({
  source: z.httpUrl(),
  branch: z.object({
    target: z.string(),
  }),
});

export type SpecNovaPackage = z.infer<typeof specNovaPackageSchema>;

type PackageJson = {
  version: Semver;
  specnova: SpecNovaPackage;
};

export class NpmPackage {
  static PKG_PATH = path(process.cwd(), 'package.json');
  private packageJson: PackageJson;

  static getPackage(): PackageJson {
    const text = readFileSync(NpmPackage.PKG_PATH, 'utf8');
    const pkg = converter.fromText<PackageJson>(text, 'json');
    return { ...pkg, specnova: specNovaPackageSchema.parse(pkg.specnova) };
  }

  constructor() {
    this.packageJson = NpmPackage.getPackage();
  }

  async editPackage(values: Partial<SpecNovaPackage>) {
    const pkg = this.packageJson;
    // Merge values
    pkg.specnova = specNovaPackageSchema.parse({
      ...pkg.specnova,
      ...values,
    });
    writeFileSync(NpmPackage.PKG_PATH, converter.fromJson(pkg, true), 'utf8');
    this.packageJson = pkg;
  }

  async getPackageSpecnova() {
    const pkg = this.packageJson;
    return pkg['specnova'];
  }
}
