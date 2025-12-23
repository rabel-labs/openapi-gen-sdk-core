import { Resolved } from '@/config/type';
import {
  defaultParserOperationIdConfig,
  parserOperationIdConfig,
} from '@/core/parser/operationId/config';

import z from 'zod';

export const parserConfig = z.object({
  operationId: z.optional(parserOperationIdConfig),
  sort: z.optional(z.null()),
});
export type ParserConfig = z.infer<typeof parserConfig>;

export const defaultParserConfig: Resolved<ParserConfig> = {
  operationId: defaultParserOperationIdConfig,
  sort: null,
} as const;
