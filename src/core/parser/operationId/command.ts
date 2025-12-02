import { CommandParserHandler } from '@/core/parser/base';
import { isOpenApi3x } from '@/core/predicate';
import {
  OpenApi3_1Element,
  refractorPluginNormalizeOperationIds,
} from '@swagger-api/apidom-ns-openapi-3-1';
import { createOperationIdParser } from '@/core/parser/operationId/action';
import { toValue } from '@swagger-api/apidom-core';
import { createParserHandler } from '@/core/parser/helpers';

const operationIdParsers: CommandParserHandler[] = [
  createParserHandler(isOpenApi3x, (element) => {
    const openApiElement = OpenApi3_1Element.refract(element, {
      plugins: [
        refractorPluginNormalizeOperationIds({
          operationIdNormalizer: createOperationIdParser(),
        }),
      ],
    });
    const test = toValue(openApiElement);
    console.log(test.paths);
    return element;
  }),
];

export default operationIdParsers;
