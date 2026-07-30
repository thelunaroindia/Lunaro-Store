import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

/**
 * Checks whether a real file exists inside /public.
 * This utility must only be imported by Server Components.
 */
export function hasPublicAsset(relativePath: string): boolean {
  try {
    const absolutePath = path.join(
      process.cwd(),
      'public',
      relativePath
    );

    return fs.existsSync(absolutePath);
  } catch {
    return false;
  }
}