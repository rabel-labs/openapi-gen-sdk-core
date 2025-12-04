import { CommandParserHandler, ParserCommandName } from '@/core/parser/base';
import { ResolvedConfig } from '@/core/parser/operationId/action';
import { PredicateFunc } from '@/core/predicate';

import { Element } from '@swagger-api/apidom-core';
import { OpenApi3_1Element } from '@swagger-api/apidom-ns-openapi-3-1';

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
 * @param handler - (element: E, options?: Partial<ResolvedConfig>) => T
 * @param refractor - Refractable - default Element
 * @returns - VisitorHandler<E, T>
 */
export function refractParseHandler<E extends Element>(
  name: ParserCommandName,
  predicate: PredicateFunc<E>,
  plugins: (options?: Partial<ResolvedConfig>) => RefractablePlugin[],
  refractor: Refractable = Element,
): CommandParserHandler<E> {
  return {
    name,
    predicate,
    handler: (element: E, options?: Partial<ResolvedConfig>) => {
      const refractorTarget = refractor ?? element.constructor;
      if (!isRefractable(refractorTarget)) throw new Error('ParserCommander: no refractor found');
      const h = refractorTarget.refract(element, {
        plugins: plugins(options) ?? [],
      }) as E;
      return h;
    },
  };
}
