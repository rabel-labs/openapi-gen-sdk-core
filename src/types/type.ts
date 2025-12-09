import { Info } from '@/core/extracter/info/type';
import { SnapshotFileExtension } from '@/core/snapshot/config';

import { Element } from '@swagger-api/apidom-core';

export type OpenApiSource = {
  source: string;
  info: Info;
  parseResult: Element;
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
