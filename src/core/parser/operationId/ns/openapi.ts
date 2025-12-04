import { operationIdNormalizer } from '@/core/parser/operationId/lib/utils';
import { RefractablePlugin } from '@/core/parser/types/refractable';

import { OpenApi3_1Element } from '@swagger-api/apidom-ns-openapi-3-1';
import { refractorPluginNormalizeOperationIds } from '@swagger-api/apidom-ns-openapi-3-1';

/**
 * Create a RefractablePlugin.
 * For OpenAPI 2.0 and 3.x.
 * @param option - ParserCommandOptions
 * @returns - RefractablePlugin
 */
const refractorPluginOpenapiOperationIdImpotentParser = new RefractablePlugin(
  (option) =>
    refractorPluginNormalizeOperationIds({
      operationIdNormalizer: operationIdNormalizer(option?.operationId),
    }),
  OpenApi3_1Element,
);

export default refractorPluginOpenapiOperationIdImpotentParser;
