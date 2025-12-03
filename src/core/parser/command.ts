import { CommandExecutor, CommandParserHandler, ParserHandlersShape } from '@/core/parser/base';
import { ResolvedConfig } from '@/core/parser/operationId/action';
import { Element } from '@swagger-api/apidom-core';

export class ParserCommander implements CommandExecutor {
  private handlers: ParserHandlersShape = {
    operationId: [],
    sort: [],
  };
  constructor(handlers?: ParserHandlersShape) {
    if (handlers) {
      this.handlers = handlers;
    }
  }
  push(...handlers: CommandParserHandler<Element>[]) {
    for (const h of handlers) {
      switch (h.name) {
        case 'operationId':
          this.handlers.operationId.push(h);
          break;
        case 'sort':
          this.handlers.sort.push(h);
          break;
        default:
          throw new Error('ParserCommander: unknown command');
      }
    }
  }
  operationId<T extends Element>(element: T, options?: Partial<ResolvedConfig>): T {
    for (const h of this.handlers.operationId) {
      if (h.predicate(element)) {
        return h.handler(element, options) as T;
      }
    }
    throw new Error('ParserCommander: no handler found');
  }
  sort<T extends Element>(element: T, options?: Partial<ResolvedConfig>): T {
    for (const h of this.handlers.sort) {
      if (h.predicate(element)) {
        return h.handler(element, options) as T;
      }
    }
    throw new Error('ParserCommander: no handler found');
  }
}
