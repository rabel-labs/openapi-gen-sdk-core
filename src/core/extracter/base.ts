import { PredicateFunc } from '@/core/predicate';

import { Element } from '@swagger-api/apidom-core';

export interface ExtractHandler<E extends Element, T> {
  predicate: PredicateFunc<E>;
  handler: (element: E) => Readonly<T>;
}

export type ExtractHandlers<T> = ExtractHandler<any, T>[];

export abstract class Extracter<T> {
  constructor(protected handlers: ExtractHandler<any, T>[] = []) {}
  /**
   * Extract a value from an Element.
   * @param element - Element
   * @returns - T
   */
  extract(element: Element): T {
    for (const h of this.handlers) {
      if (h.predicate(element)) {
        return h.handler(element);
      }
    }
    throw new Error('Visitor: no handler found');
  }
  /**
   * Create a ExtractHandler.
   * @param predicate - ElementPredicate<E>
   * @param handler - (element: E) => T
   * @returns - ExtractHandler<E, T>
   */
  static createHandler<E extends Element, T>(
    predicate: PredicateFunc<E>,
    handler: (element: E) => T,
  ): ExtractHandler<E, T> {
    return { predicate, handler };
  }
}
