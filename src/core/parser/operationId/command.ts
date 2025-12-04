import { CommandParserHandler } from '@/core/parser/base';
import { createOperationIdParser } from '@/core/parser/operationId/action';
import { refractParser } from '@/core/parser/refract';
import { isOpenApi2, isOpenApi3x } from '@/core/predicate';

import {
  OpenApi3_1Element,
  refractorPluginNormalizeOperationIds,
} from '@swagger-api/apidom-ns-openapi-3-1';

const operationIdParsers: CommandParserHandler[] = [
  refractParser(
    'operationId',
    isOpenApi2,
    (options) => [
      refractorPluginNormalizeOperationIds({
        operationIdNormalizer: createOperationIdParser(
          options?.openapiGenConfig?.parser?.operationId,
        ),
      }),
    ],
    OpenApi3_1Element,
  ),
  refractParser(
    'operationId',
    isOpenApi3x,
    (options) => [
      refractorPluginNormalizeOperationIds({
        operationIdNormalizer: createOperationIdParser(
          options?.openapiGenConfig?.parser?.operationId,
        ),
      }),
    ],
    OpenApi3_1Element,
  ),
];
export default operationIdParsers;
