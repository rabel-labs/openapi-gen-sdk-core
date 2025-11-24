import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { OpenApiSource } from './type';

/**
 * Extract an OpenAPI spec from a URL or local file path.
 * @param {string} input - URL or local file path
 * @returns An object with `text`, `pathname` and `extension` properties.
 */
export async function fetchOpenApiSource(input: string): Promise<OpenApiSource> {
  console.log('🔨 Extracting OpenAPI spec from:', input);
  let text;
  if (input.startsWith('http://') || input.startsWith('https://')) {
    const res = await fetch(input);
    if (!res.ok) throw new Error('❌ Failed to fetch spec: ' + res.statusText);
    text = await res.text();
  } else {
    text = fs.readFileSync(path.resolve(process.cwd(), input), 'utf8');
  }

  const pathname =
    input.startsWith('http://') || input.startsWith('https://') ? new URL(input).pathname : input;

  const extension = path.extname(pathname).toLowerCase();

  return { text, pathname, extension };
}
