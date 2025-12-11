import crypto from 'crypto';
import { createReadStream } from 'fs';

export type Sha256String = string;

export async function digestFile(filePath: string): Promise<Sha256String> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

export async function digestString(text: string): Promise<Sha256String> {
  try {
    const hash = crypto.createHash('sha256');
    hash.update(text);
    return Promise.resolve(hash.digest('hex'));
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 * Compare a sha256 string to a target file.
 * @param digests - Promise<[Sha256String, Sha256String]>
 * @returns - Resolve -> true if identical
 *            Reject -> Failed
 */
export async function compareSha256(
  digests: Promise<Sha256String> | Sha256String,
  filePath: string,
): Promise<boolean> {
  try {
    //# Load digest
    const [digest] = await Promise.race([digests]);
    switch (typeof digest) {
      //... accepted types
      case 'string':
        break;
      //... invalid
      default:
        return Promise.reject();
    }
    //# Load file to digest
    const fileDigest = await digestFile(filePath);
    switch (typeof fileDigest) {
      //... accepted types
      case 'string':
        break;
      //... invalid
      default:
        return Promise.reject();
    }
    //# Compare
    return Promise.resolve(digest === fileDigest);
  } catch (error) {
    //# Any error
    Promise.reject(error);
  }
  //# Default
  return Promise.resolve(false);
}
