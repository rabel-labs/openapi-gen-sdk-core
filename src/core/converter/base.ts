import { SnapshotFileExtension } from '@/core/snapshot/config';

import { Element, toJSON, toYAML } from '@swagger-api/apidom-core';

type ConverterExtension = SnapshotFileExtension;

export class Converter {
  constructor() {}
  private getApiDomConverter(extension: ConverterExtension): typeof toJSON | typeof toYAML {
    switch (extension) {
      case 'yaml':
        return toYAML;
      case 'json':
      default:
        return toJSON;
    }
  }
  fromApiDom<T extends Element = Element>(element: T, extension: ConverterExtension): string {
    return this.getApiDomConverter(extension)(element);
  }
}
