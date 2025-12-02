import { Element } from '@swagger-api/apidom-core';
import { CommandParserHandler } from '@/core/parser/base';
import { PredicateFunc } from '@/core/predicate';
import { ResolvedConfig } from '@/core/parser/operationId/action';

/**
 * Create a VisitorHandler.
 * @param predicate - ElementPredicate<E>
 * @param handler - (element: E) => T
 * @returns - VisitorHandler<E, T>
 */
export function createParserHandler<E extends Element>(
  predicate: PredicateFunc<E>,
  handler: (element: E, options?: Partial<ResolvedConfig>) => E,
): CommandParserHandler<E> {
  return {
    name: 'operationId',
    predicate,
    handler: (element: E, options?: Partial<ResolvedConfig>) => {
      // element is Element, but predicate ensures it's E
      return handler(element as E, options);
    },
  };
}
