import { Info } from '@/core/extracter/info/type';
import { StrictSnapshotFile } from '@/types/files';

import { Element } from '@swagger-api/apidom-core';

export type SpecnovaSource = {
  source: string;
  info: Info;
  parseResult: Element;
  extension: StrictSnapshotFile;
  isExternal: boolean;
};
