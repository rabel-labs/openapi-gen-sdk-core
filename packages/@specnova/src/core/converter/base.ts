import { SnapshotFileExtension, StrictSnapshotFile } from '@/types/files';

import { Element, toJSON, toYAML } from '@swagger-api/apidom-core';

export class Converter {
  constructor() {}
  private getApiDomConverter(extension: StrictSnapshotFile): typeof toJSON | typeof toYAML {
    switch (extension) {
      case 'yaml':
      case 'yml':
        return toYAML;
      case 'json':
      default:
        return toJSON;
    }
  }
  fromApiDom<T extends Element = Element>(element: T, extension: StrictSnapshotFile): string {
    return this.getApiDomConverter(extension)(element);
  }
  fromJson<T extends Object>(json: T, readable: boolean = false): string {
    return JSON.stringify(json, null, readable ? 2 : 0);
  }
  fromText<T extends Object>(text: string, extension: SnapshotFileExtension): T {
    let o: T;
    switch (extension) {
      case 'json':
      default:
        o = JSON.parse(text) as T;
        break;
    }
    return o;
  }
}
