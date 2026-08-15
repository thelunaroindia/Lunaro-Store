import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

// Signed, HttpOnly, server-verifiable early-access grant — deliberately
// NOT a plain "earlyAccess=true" cookie a visitor could set from the
// browser console, and deliberately not backed by a database (nothing to
// look up; the token itself carries everything needed to verify it).
//
// The token never contains an email address or any other PII — just a
// version marker and an expiry — so there's nothing personal to protect
// if the cookie is ever inspected, only the grant itself, which the HMAC
// signature makes tamper-evident (flipping bits, or hand-writing a token
// without the secret, fails verification).

const COOKIE_NAME = 'lunaro_early_access';
const SECRET = process.env.EARLY_ACCESS_COOKIE_SECRET;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days — "unlock this device" duration

function sign(payload: string): string {
  if (!SECRET) {
    throw new Error(
      'EARLY_ACCESS_COOKIE_SECRET is not configured — cannot sign an early-access grant.'
    );
  }
  return createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function createEarlyAccessToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ v: 1, exp: Date.now() + MAX_AGE_SECONDS * 1000 })
  ).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string): boolean {
  if (!SECRET) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  let expected: Buffer;
  let actual: Buffer;
  try {
    expected = Buffer.from(sign(payload));
    actual = Buffer.from(signature);
  } catch {
    return false;
  }

  // Constant-time comparison, and both buffers must already be equal
  // length — timingSafeEqual throws on a length mismatch rather than
  // returning false, so a malformed/truncated token must be rejected
  // before it ever reaches the comparison.
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return false;
  }

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp?: number;
    };
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

// Server Components / Route Handlers only (reads the incoming request's
// cookies via next/headers) — never import this into a client component.
export function isEarlyAccessGranted(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value;
  return Boolean(token && verifyToken(token));
}

export const EARLY_ACCESS_COOKIE = {
  name: COOKIE_NAME,
  maxAgeSeconds: MAX_AGE_SECONDS,
} as const;
