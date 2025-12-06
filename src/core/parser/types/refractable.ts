import { defaultOpenapiGenConfig } from '@/config/default';
import { ParserCommandHandler, ParserCommandName, ParserCommandOptions } from '@/core/parser/base';
import { PredicateFunc } from '@/core/predicate';

import { Element } from '@swagger-api/apidom-core';

export type Refractable = {
  refract: typeof Element.refract;
};

function isRefractable(value: any): value is Refractable {
  return typeof value?.refract === 'function';
}

type RefractableProcess = () => void;
type RefractableVisitor<E extends Element> = {
  [key in E['element']]?: {
    enter?: (...args: any[]) => void;
    leave?: (...args: any[]) => void;
  };
};

type RefractablePluginShape = (toolbox?: any) => {
  name?: string;
  pre?: RefractableProcess;
  visitor: RefractableVisitor<Element>;
  post?: RefractableProcess;
};

/**
 * Create a RefractablePlugin instance.
 * @param plugin - RefractablePluginShape
 * @param refractor - Refractable
 * @static defaultOption - Default ParserCommandOptions
 * @static createHandler - Create a ParserCommandHandler
 * @public plugin - (option?: ParserCommandOptions) => RefractablePluginShape
 * @public Element - Refractable
 * @returns - RefractablePlugin
 */
export class RefractablePlugin {
  public plugin: (option?: ParserCommandOptions) => RefractablePluginShape;
  public Element: Refractable;
  private readonly defaultOption: ParserCommandOptions = defaultOpenapiGenConfig.normalized;
  constructor(
    plugin: (option?: ParserCommandOptions) => RefractablePluginShape,
    refractor?: Refractable,
  ) {
    this.plugin = (option?: ParserCommandOptions) => plugin(option ?? this.defaultOption);
    this.Element = isRefractable(refractor) ? refractor : Element;
  }
  static createHandler<E extends Element>(
    name: ParserCommandName,
    predicate: PredicateFunc<E>,
    refractable: RefractablePlugin,
  ): ParserCommandHandler<E> {
    return {
      name,
      predicate,
      handler: (element: E, options?: ParserCommandOptions) => {
        const refractorTarget = refractable.Element;
        if (!isRefractable(refractorTarget)) throw new Error('ParserCommander: no refractor found');
        const h = refractorTarget.refract(element, {
          plugins: [refractable.plugin(options)],
        }) as E;
        return h;
      },
    };
  }
}
