import resolvedConfig from '@/config';
import { infoExtracter } from '@/core/extracter';
import { isSnapshotFileExtensionName } from '@/core/snapshot/config';
import { OpenApiSource } from '@/utils';

import { extname as pathExtname, resolve as path } from 'path';

import { options, parse as emptyParse } from '@swagger-api/apidom-reference/configuration/empty';
import ApiDOMDereferenceStrategy from '@swagger-api/apidom-reference/dereference/strategies/apidom';
import OpenAPI2DereferenceStrategy from '@swagger-api/apidom-reference/dereference/strategies/openapi-2';
import OpenAPI3_0DereferenceStrategy from '@swagger-api/apidom-reference/dereference/strategies/openapi-3-0';
import OpenAPI3_1DereferenceStrategy from '@swagger-api/apidom-reference/dereference/strategies/openapi-3-1';
import OpenAPIJSON2Parser from '@swagger-api/apidom-reference/parse/parsers/openapi-json-2';
import OpenAPIJSON3_0Parser from '@swagger-api/apidom-reference/parse/parsers/openapi-json-3-0';
import OpenAPIJSON3_1Parser from '@swagger-api/apidom-reference/parse/parsers/openapi-json-3-1';
import OpenAPIYAML2Parser from '@swagger-api/apidom-reference/parse/parsers/openapi-yaml-2';
import OpenAPIYAML3_0Parser from '@swagger-api/apidom-reference/parse/parsers/openapi-yaml-3-0';
import OpenAPIYAML3_1Parser from '@swagger-api/apidom-reference/parse/parsers/openapi-yaml-3-1';
import FileResolver from '@swagger-api/apidom-reference/resolve/resolvers/file';
import HTTPResolverAxios from '@swagger-api/apidom-reference/resolve/resolvers/http-axios';
import OpenAPI2ResolveStrategy from '@swagger-api/apidom-reference/resolve/strategies/openapi-2';
import OpenAPI3_0ResolveStrategy from '@swagger-api/apidom-reference/resolve/strategies/openapi-3-0';
import OpenAPI3_1ResolveStrategy from '@swagger-api/apidom-reference/resolve/strategies/openapi-3-1';

const rootDir =
  typeof resolvedConfig.snapshot.folder === 'string' ? resolvedConfig.snapshot.folder : '';

const localRootDir = path(process.cwd(), rootDir);

//-> Resolve Component
//? https://github.com/swagger-api/apidom/tree/main/packages/apidom-reference#resolve-component
//# Strategies
//? https://github.com/swagger-api/apidom/tree/main/packages/apidom-reference#external-resolution-strategies-execution-order
options.resolve.strategies = [
  new OpenAPI2ResolveStrategy(),
  new OpenAPI3_0ResolveStrategy(),
  new OpenAPI3_1ResolveStrategy(),
];
//# Resolvers
//? https://github.com/swagger-api/apidom/tree/main/packages/apidom-reference#resolve-component
options.resolve.resolvers = [
  new FileResolver({
    fileAllowList: [
      `${localRootDir}/**/*.json`,
      `${localRootDir}/**/*.yaml`,
      `${localRootDir}/**/*.yml`,
    ],
  }),
  new HTTPResolverAxios({
    timeout: 5000,
    redirects: 5,
    withCredentials: false,
  }),
];
//# Resolver Options
options.resolve.resolverOpts = {
  axiosConfig: {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  },
};
//# Resolver Strategies
//? https://github.com/swagger-api/apidom/tree/main/packages/apidom-reference#external-resolution-strategies-execution-order
options.resolve.strategies = [
  new OpenAPI2ResolveStrategy(),
  new OpenAPI3_0ResolveStrategy(),
  new OpenAPI3_1ResolveStrategy(),
];

//-> Parse
//? https://github.com/swagger-api/apidom/tree/main/packages/apidom-reference#parse-component
//# Parsers
//? https://github.com/swagger-api/apidom/tree/main/packages/apidom-reference#parser-plugins-execution-order
options.parse.parsers = [
  new OpenAPIJSON2Parser({ allowEmpty: true, sourceMap: false }),
  new OpenAPIYAML2Parser({ allowEmpty: true, sourceMap: false }),
  new OpenAPIJSON3_0Parser({ allowEmpty: true, sourceMap: false }),
  new OpenAPIYAML3_0Parser({ allowEmpty: true, sourceMap: false }),
  new OpenAPIJSON3_1Parser({ allowEmpty: true, sourceMap: false }),
  new OpenAPIYAML3_1Parser({ allowEmpty: true, sourceMap: false }),
];

//-> Dereference
//? https://github.com/swagger-api/apidom/tree/main/packages/apidom-reference#dereference-component
//# Strategies
//? https://github.com/swagger-api/apidom/tree/main/packages/apidom-reference#dereference-strategies-execution-order
options.dereference.strategies = [
  new OpenAPI2DereferenceStrategy(),
  new OpenAPI3_0DereferenceStrategy(),
  new OpenAPI3_1DereferenceStrategy(),
  new ApiDOMDereferenceStrategy(),
];
//-> Dereference
//? https://github.com/swagger-api/apidom/tree/main/packages/apidom-reference#bundle-component
//# Strategies
//? https://github.com/swagger-api/apidom/tree/main/packages/apidom-reference#bundle-strategies-execution-order
options.dereference.strategies = [new OpenAPI3_1DereferenceStrategy()];

const populatedParse = emptyParse;

//-> FUNCS
/**
 * Parse a given OpenAPI spec source (URL or local file path).
 * @param source - The OpenAPI spec source.
 * @returns - OpenApiSource
 */
export async function parseSource(source: string): Promise<OpenApiSource> {
  console.log('🔨 Extracting OpenAPI spec from:', source);
  //# Parse
  const parsed = await populatedParse(source);
  if (parsed.errors.length > 0 || !parsed.result) {
    throw new Error('❌ Failed to parse spec');
  }
  //# Compute
  const isExternal = source.startsWith('http://') || source.startsWith('https://');
  const pathname = isExternal ? new URL(source).pathname : source;
  const extension = pathExtname(pathname).toLowerCase().replace('.', '');
  //# Validate
  if (!isSnapshotFileExtensionName(extension)) {
    throw new Error(`❌ Snapshot: invalid file extension, ${extension}`);
  }
  if (!parsed.result) {
    throw new Error('❌ Failed to parse spec');
  } else {
    console.log('✅ Parsed spec');
  }
  //# Extract info
  const info = infoExtracter.extract(parsed.result);
  //-
  return {
    parseResult: parsed.result,
    info,
    source,
    extension,
    isExternal,
  };
}
