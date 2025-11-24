import YAML from 'yaml';
import { OpenApiSource } from './type';

/**
 * Parse an OpenAPI spec from text.
 * @param {string} text - JSON or YAML
 * @param extension - File extension, ".json" or ".yaml".
 */
export function parseOpenApiSpec({ text, extension }: OpenApiSource) {
  let spec;
  switch (extension) {
    case '.json':
      spec = JSON.parse(text);
      console.log('✨ Parsed as JSON');
      break;
    case '.yaml':
    case '.yml':
      spec = YAML.parse(text);
      console.log('✨ Parsed as YAML');
      break;
    default:
      throw new Error(`❌ Unsupported file extension: ${extension}`);
  }
  return spec;
}

/**
 * Get the OpenAPI version from a spec text.
 * @param text - The spec text.
 * @param extension - The file extension.
 * @returns The OpenAPI version.
 */
export function getOpenApiVersion({ text, extension }: OpenApiSource) {
  switch (extension) {
    case '.json':
      return JSON.parse(text)?.info?.version;
    case '.yaml':
    case '.yml':
      return YAML.parse(text)?.info?.version;
    default:
      throw new Error('Unknown file extension: ' + extension);
  }
}
