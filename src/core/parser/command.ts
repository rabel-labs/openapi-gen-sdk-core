import {
  CommandExecutor,
  CommandParserHandler,
  ParserHandlersShape,
  ParserOptions,
} from '@/core/parser/base';

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
      if (h.name in this.handlers) {
        this.handlers[h.name].push(h);
      } else {
        throw new Error('ParserCommander: unknown command');
      }
    }
  }
  operationId<T extends Element>(element: T, options?: ParserOptions): T {
    for (const h of this.handlers.operationId) {
      if (h.predicate(element)) {
        return h.handler(element, options) as T;
      }
    }
    throw new Error('ParserCommander: no handler found');
  }
  sort<T extends Element>(element: T, options?: ParserOptions): T {
    for (const h of this.handlers.sort) {
      if (h.predicate(element)) {
        return h.handler(element, options) as T;
      }
    }
    throw new Error('ParserCommander: no handler found');
  }
}
