import { CommandParserHandler } from '@/core/parser/base';
import { createParserHandler } from '@/core/parser/helpers';
import { createOperationIdParser } from '@/core/parser/operationId/action';
import { isOpenApi2, isOpenApi3x } from '@/core/predicate';

import {
  OpenApi3_1Element,
  refractorPluginNormalizeOperationIds,
} from '@swagger-api/apidom-ns-openapi-3-1';

const operationIdParsers: CommandParserHandler[] = [
  createParserHandler('operationId', isOpenApi2, (options) => [
    refractorPluginNormalizeOperationIds({
      operationIdNormalizer: createOperationIdParser(options),
    }),
  ]),
  createParserHandler(
    'operationId',
    isOpenApi3x,
    (options) => [
      refractorPluginNormalizeOperationIds({
        operationIdNormalizer: createOperationIdParser(options),
      }),
    ],
    OpenApi3_1Element,
  ),
];
export default operationIdParsers;
