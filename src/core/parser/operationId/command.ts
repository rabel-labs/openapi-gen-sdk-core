import { ParserCommandHandler } from '@/core/parser/base';
import refractorPluginOpenapiOperationIdImpotentParser from '@/core/parser/operationId/ns/openapi';
import { RefractablePlugin } from '@/core/parser/types/refractable';
import { isOpenApi2, isOpenApi3x } from '@/core/predicate';

const operationIdCommand: ParserCommandHandler[] = [
  RefractablePlugin.createHandler(
    'operationId',
    isOpenApi2,
    refractorPluginOpenapiOperationIdImpotentParser,
  ),
  RefractablePlugin.createHandler(
    'operationId',
    isOpenApi3x,
    refractorPluginOpenapiOperationIdImpotentParser,
  ),
];

export default operationIdCommand;
