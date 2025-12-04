import { ResolvedOpenapiGenConfig } from '@/commands/config';
import { PredicateFunc } from '@/core/predicate';

import { Element } from '@swagger-api/apidom-core';

export type ParserCommandName = 'operationId' | 'sort';

export type ParserOptions = Partial<ResolvedOpenapiGenConfig>;

export type ParserCommand<E extends Element> = (element: E, options?: ParserOptions) => E;

export interface CommandParserHandler<PE extends Element = any> {
  name: ParserCommandName;
  predicate: PredicateFunc<PE>;
  handler: ParserCommand<PE>;
}

export interface ParserHandlersShape {
  operationId: CommandParserHandler<Element>[];
  sort: CommandParserHandler<Element>[];
}

export type CommandExecutor = {
  [Name in ParserCommandName]: ParserCommand<Element>;
};
