type NormalizeFunc = (operationId: string, path: string, method: string) => string;
type SkipNormalizeFunc = (path: string, method: string) => boolean;

type NormalizeOptions = {
  /**
   * Word to use as root path ( '/'  => 'root' )
   * @default 'root'
   */
  rootWord: string;
  /**
   * 'prefix' => {method}{...}
   * 'suffix' => {...}{method}
   * @default 'prefix'
   */
  methodPosition: 'prefix' | 'suffix';
  /**
   * 'snake' | 'camel' | 'pascal' | 'kebab'
   * @default 'camel'
   */
  caseStyle: 'snake' | 'camel' | 'pascal' | 'kebab';
  /**
   * 'by' => by{paramName}
   * 'inline' => {paramName}
   * @default 'by'
   */
  paramStyle: 'by' | 'inline';
  /**
   * Skip refactoring if function returns true
   * @default undefined
   */
  skipRefactoring?: boolean | SkipNormalizeFunc;
};

const defaultConfig: NormalizeOptions = {
  rootWord: 'root',
  methodPosition: 'prefix',
  caseStyle: 'camel',
  paramStyle: 'by',
  skipRefactoring: false,
};

/**
 * Sanitize path
 * @param s - eg. 'a/b/c'
 * @returns - eg. 'a b c'
 */
const sanitize = (s: string) =>
  s
    .trim()
    .replace(/^[\/\s]+|[\/\s]+$/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim();

/**
 * Transform path to tokens
 * @param str - eg. 'a/b/c'
 * @returns - eg. ['a', 'b', 'c']
 */
const toTokens = (str: string): string[] => {
  const t = sanitize(str);
  if (!t) return [];
  return t.split(/\s+/);
};

/**
 * Transform tokens to case
 * @param caseStyle - 'snake' | 'kebab' | 'camel' | 'pascal'
 * @param tokens - eg. ['a', 'b', 'c']
 * @returns - eg. 'aBC'
 */
const toCase = (caseStyle: NormalizeOptions['caseStyle'], tokens: string[]): string => {
  if (!tokens.length) return '';
  switch (caseStyle) {
    case 'snake':
      return tokens.join('_').toLowerCase();
    case 'kebab':
      return tokens.join('-').toLowerCase();
    case 'camel':
      return tokens
        .map((tok, i) =>
          i === 0 ? tok.toLowerCase() : tok[0].toUpperCase() + tok.slice(1).toLowerCase(),
        )
        .join('');
    case 'pascal':
      return tokens.map((tok) => tok[0].toUpperCase() + tok.slice(1).toLowerCase()).join('');
  }
};

/**
 * Check if segment is a path param
 * @param segment - eg. '{id}'
 * @returns - true if segment is a path param
 */
const isPathParam = (segment: string) => /^\{.*\}$/.test(segment);

export function createOperationIdParser(options?: Partial<NormalizeOptions>): NormalizeFunc {
  const config: NormalizeOptions = {
    ...defaultConfig,
    ...options,
  };

  return (operationId: string, path: string, method: string): string => {
    //-> skip refactoring if configured...
    switch (true) {
      case typeof config.skipRefactoring === 'function':
        if (config.skipRefactoring(path, method)) return operationId;
        break;
      case config.skipRefactoring === true:
        return operationId;
      case config.skipRefactoring === false:
      default:
        break;
    }

    //-> handle root path...
    if (!path || path === '/') {
      const rootToken = [method.toLowerCase(), config.rootWord];
      if (config.methodPosition === 'suffix') rootToken.reverse();
      return toCase(config.caseStyle, rootToken);
    }

    //-> Parse segments...
    const rawSegments = path.replace(/^\/+|\/+$/g, '').split('/');
    const resourceTokens: string[] = [];
    const paramTokens: string[] = [];

    //-> Detect path params...
    for (const seg of rawSegments) {
      if (isPathParam(seg)) {
        const paramName = seg.replace(/[\{\}]/g, '');
        if (config.paramStyle === 'by') {
          paramTokens.push(paramName);
        } else {
          resourceTokens.push(paramName);
        }
      } else {
        resourceTokens.push(...toTokens(seg));
      }
    }

    // Add the HTTP method to the tokens array...
    if (config.methodPosition === 'prefix') {
      resourceTokens.unshift(method.toLowerCase());
    } else {
      resourceTokens.push(method.toLowerCase());
    }

    //-> Transform tokens to case...
    const base = toCase(config.caseStyle, resourceTokens);

    //-> Sprinkle param suffix...
    let paramSuffix = '';
    if (paramTokens.length && config.paramStyle === 'by') {
      if (config.caseStyle === 'snake' || config.caseStyle === 'kebab') {
        paramSuffix = `${config.caseStyle === 'snake' ? '_' : '-'}by${
          config.caseStyle === 'snake' ? '_' : '-'
        }${paramTokens.join(config.caseStyle === 'snake' ? '_' : '-')}`;
      } else {
        paramSuffix = 'By' + paramTokens.map((p) => p[0].toUpperCase() + p.slice(1)).join('And');
      }
    }

    return `${base}${paramSuffix}`;
  };
}
