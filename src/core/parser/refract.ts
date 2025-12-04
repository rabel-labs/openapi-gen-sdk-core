import { CommandParserHandler, ParserCommandName, ParserOptions } from '@/core/parser/base';
import { PredicateFunc } from '@/core/predicate';

import { Element } from '@swagger-api/apidom-core';

type Refractable = {
  refract: typeof Element.refract;
};
function isRefractable(value: any): value is Refractable {
  return typeof value?.refract === 'function';
}
type RefractProcess = () => void;
type RefractVisitor<E extends Element> = {
  [key in E['element']]?: {
    enter?: (...args: any[]) => void;
    leave?: (...args: any[]) => void;
  };
};

type RefractablePlugin = (toolbox?: any) => {
  name?: string;
  pre?: RefractProcess;
  visitor: RefractVisitor<Element>;
  post?: RefractProcess;
};

/**
 * Create a VisitorHandler.
 * @param predicate - PredicateFunc<E>
 * @param handler - (element: E, options?: Partial<OpenapiGenPluginConfig>) => T
 * @param refractor - Refractable - default Element
 * @returns - VisitorHandler<E, T>
 */
export function refractParser<E extends Element>(
  name: ParserCommandName,
  predicate: PredicateFunc<E>,
  plugins: (options?: ParserOptions) => RefractablePlugin[],
  refractor: Refractable = Element,
): CommandParserHandler<E> {
  return {
    name,
    predicate,
    handler: (element: E, options?: ParserOptions) => {
      const refractorTarget = refractor ?? element.constructor;
      if (!isRefractable(refractorTarget)) throw new Error('ParserCommander: no refractor found');
      const h = refractorTarget.refract(element, {
        plugins: plugins(options) ?? [],
      }) as E;
      return h;
    },
  };
}
