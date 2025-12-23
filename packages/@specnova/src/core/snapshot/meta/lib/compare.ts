import crypto from 'crypto';
import { createReadStream } from 'fs';
import z from 'zod';

export const sha256String = z.hash('sha256');
export type Sha256String = z.infer<typeof sha256String>;

export async function digestFile(filePath: string): Promise<Sha256String> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(sha256String.parse(hash.digest('hex'))));
    stream.on('error', reject);
  });
}

export async function digestString(text: string): Promise<Sha256String> {
  try {
    const hash = crypto.createHash('sha256');
    hash.update(text);
    return Promise.resolve(sha256String.parse(hash.digest('hex')));
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 * Compare a sha256 string to a target file.
 * @param rawDigests - Promise<[Sha256String, Sha256String]>
 * @returns - Resolve -> true if identical
 *            Reject -> Failed
 */
export async function compareSha256(
  rawDigests: Promise<Sha256String> | Sha256String,
  filePath: string,
): Promise<boolean> {
  try {
    //# Load digest
    const [digest] = await Promise.race([rawDigests]);
    const parsedDigest = sha256String.safeParse(digest);
    if (!parsedDigest.success) {
      return Promise.reject();
    }
    //# Load file to digest
    const fileDigest = sha256String.safeParse(await digestFile(filePath));
    if (!fileDigest.success) {
      return Promise.reject();
    }
    //# Compare
    return Promise.resolve(parsedDigest.data === fileDigest.data);
  } catch (error) {
    //# Any error
    Promise.reject(error);
  }
  //# Default
  return Promise.resolve(false);
}
