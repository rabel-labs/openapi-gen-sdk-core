import { Resolved } from '@/config/type';

import z from 'zod';

export type IgnoreFunc = (path: string, method: string) => boolean;

export const parserOperationIdConfig = z.object({
  /**
   * Word to use as root path ( '/'  => 'root' )
   * @default 'root'
   */
  rootWord: z.string().optional(),
  /**
   * 'prefix' => {method}{...}
   * 'suffix' => {...}{method}
   * @default 'prefix'
   */
  methodPosition: z.enum(['prefix', 'suffix']).optional(),
  /**
   * 'snake' | 'camel' | 'pascal' | 'kebab'
   * @default 'camel'
   */
  case: z.enum(['snake', 'camel', 'pascal', 'kebab'] as const).optional(),
  /**
   * 'by' => by{paramName}
   * 'inline' => {paramName}
   * @default 'by'
   */
  param: z.enum(['by', 'inline'] as const).optional(),
  /**
   * Skip refactoring if function returns true
   * @default undefined
   */
  ignore: z.union([z.boolean(), z.function()]).optional(),
});
export type ParserOperationIdConfig = z.infer<typeof parserOperationIdConfig>;

export const defaultParserOperationIdConfig: Resolved<ParserOperationIdConfig> = {
  rootWord: 'root',
  methodPosition: 'prefix',
  case: 'camel',
  param: 'by',
  ignore: false,
} as const;
