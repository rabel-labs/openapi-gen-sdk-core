import { Element } from '@swagger-api/apidom-core';
import { CommandParserHandler } from '@/core/parser/base';

/**
 * Create a VisitorHandler.
 * @param predicate - ElementPredicate<E>
 * @param handler - (element: E) => T
 * @returns - VisitorHandler<E, T>
 */
export function createParserHandler<E extends Element>(
  predicate: (element: Element) => element is E,
  handler: (element: E) => Element,
): CommandParserHandler<Element> {
  return {
    name: 'operationId',
    predicate,
    handler: (element: Element) => {
      // element is Element, but predicate ensures it's E
      return handler(element as E);
    },
  };
}
