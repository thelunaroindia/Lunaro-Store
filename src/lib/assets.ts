import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Checks whether a real file exists at /public/<relativePath>. Used only
 * by Server Components (never import this from a 'use client' file) so
 * they can render the real asset the instant it's dropped in, falling
 * back to CinematicPlaceholder until then — no code edit needed on
 * generation day. See docs/HOMEPAGE_ASSET_PROMPTS.md for the exact paths
 * this is meant to detect.
 */
export function hasPublicAsset(relativePath: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), 'public', relativePath));
  } catch {
    return false;
  }
}
