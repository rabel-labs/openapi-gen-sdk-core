import { defaultOpenapiGenConfig } from '@/config/default';
import { OpenapiGenConfig } from '@/config/type';
import { hasNormalize, mergeWithDefaults } from '@/config/utils';
import { ParserConfig } from '@/core/parser/config';
import { PredicateFunc } from '@/core/predicate';

import { Element } from '@swagger-api/apidom-core';

export type ParserCommandName = keyof ParserConfig;
export type ParserCommandOptions = Partial<ParserConfig>;

type ParserCommandHandlerFunc<E extends Element, O = any> = (element: E, options?: O) => E;

export interface ParserCommandHandler<PE extends Element = any> {
  name: ParserCommandName;
  predicate: PredicateFunc<PE>;
  handler: ParserCommandHandlerFunc<PE, ParserCommandOptions>;
}

interface ParserCommandHandlers {
  operationId: ParserCommandHandler<Element>[];
  sort: ParserCommandHandler<Element>[];
}

type ParserCommanderImpl = {
  [Name in ParserCommandName]: ParserCommandHandlerFunc<Element>;
};

export class ParserCommander implements ParserCommanderImpl {
  private handlers: ParserCommandHandlers = {
    operationId: [],
    sort: [],
  };
  constructor(handlers?: ParserCommandHandlers) {
    if (handlers) {
      this.handlers = handlers;
    }
  }
  push(...handlers: ParserCommandHandler<Element>[]) {
    for (const h of handlers) {
      if (h.name in this.handlers) {
        this.handlers[h.name].push(h);
      } else {
        throw new Error('ParserCommander: unknown command');
      }
    }
  }
  operationId<T extends Element>(element: T, options?: ParserCommandOptions): T {
    for (const h of this.handlers.operationId) {
      if (h.predicate(element)) {
        return h.handler(element, options) as T;
      }
    }
    throw new Error('ParserCommander: no handler found');
  }
  sort<T extends Element>(element: T, options?: ParserCommandOptions): T {
    for (const h of this.handlers.sort) {
      if (h.predicate(element)) {
        return h.handler(element, options) as T;
      }
    }
    throw new Error('ParserCommander: no handler found');
  }
  byConfig<T extends Element>(element: T, config?: OpenapiGenConfig): T {
    const mergedConfig = mergeWithDefaults(defaultOpenapiGenConfig, config);
    if (!mergedConfig.normalized || !hasNormalize(mergedConfig)) {
      console.log('✅ No normalization settings found');
      return element;
    } else {
      const key = Object.keys(mergedConfig.normalized);
      let normalizedElement = element;
      for (const cn of key as ParserCommandName[]) {
        try {
          normalizedElement = this[cn](normalizedElement, mergedConfig.normalized);
        } catch (e) {
          console.error(`ParserCommander: failed to execute ${cn} command\n`, e);
        }
      }
      return normalizedElement;
    }
  }
}
