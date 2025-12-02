import { ParserCommander } from '@/core/parser/base';
import operationIdParsers from './operationId/command';

const parserCommander = new ParserCommander();

parserCommander.push(...operationIdParsers);

export default parserCommander;
