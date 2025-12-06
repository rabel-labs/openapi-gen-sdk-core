export type IgnoreFunc = (path: string, method: string) => boolean;

export type ParserOperationIdConfig = {
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
  ignore?: boolean | IgnoreFunc;
  //! TODO:
  //pluralize?: boolean // product/{id} → products/{id}
};

export const defaultParserOperationIdConfig: Required<ParserOperationIdConfig> = {
  rootWord: 'root',
  methodPosition: 'prefix',
  caseStyle: 'camel',
  paramStyle: 'by',
  ignore: false,
};
