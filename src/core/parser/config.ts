import {
  defaultParserOperationIdConfig,
  ParserOperationIdConfig,
} from '@/core/parser/operationId/config';

export type ParserConfig = {
  operationId: ParserOperationIdConfig;
  sort: null;
};

export const defaultParserConfig: Required<ParserConfig> = {
  operationId: defaultParserOperationIdConfig,
  sort: null,
};
