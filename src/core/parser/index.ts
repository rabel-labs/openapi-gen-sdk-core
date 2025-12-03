import { ParserCommander } from '@/core/parser/command';
import operationIdParsers from '@/core/parser/operationId/command';

const parserCommander = new ParserCommander();

parserCommander.push(...operationIdParsers);

export default parserCommander;
