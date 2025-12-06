import { SnapshotFileExtension } from '@/core/snapshot/config';

import { Element } from '@swagger-api/apidom-core';

export type OpenApiSource = {
  parseResult: Element;
  source: string;
  extension: SnapshotFileExtension;
  isExternal: boolean;
};

export type OpenApiPackageInfo = {
  source: string;
  version: string;
  syncVersion?: boolean;
};

export type PackageJson = {
  version: string;
  openapi: OpenApiPackageInfo;
  [key: string]: string | number | boolean | Object;
};
