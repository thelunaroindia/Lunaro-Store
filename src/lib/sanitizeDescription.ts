// TypeScript may not have type declarations for 'server-only' (side-effect import).
// @ts-ignore: Module has no type declarations
import 'server-only';
import sanitizeHtml from 'sanitize-html';

// Shopify's rich-text description editor only ever produces this small,
// known set of tags (paragraphs, line breaks, bold/italic/underline,
// lists, links) — never scripts, iframes, or embeds. Sanitizing anyway
// (rather than trusting Admin-authored content outright) is defense in
// depth, not a guess at what might appear.
//
// `server-only` above makes this a hard build error if anything ever
// imports it from a Client Component's module graph — sanitize-html
// (via htmlparser2) is too heavy to ship to the browser for a value that
// only needs to be computed once, server-side, per page render. Callers
// (src/app/products/[handle]/page.tsx) sanitize once and pass the
// resulting string down as a prop; ProductAccordion only ever renders
// that already-sanitized string, never sanitize-html itself.
const DESCRIPTION_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a'],
  allowedAttributes: { a: ['href'] },
};

export function sanitizeDescriptionHtml(html: string): string {
  return sanitizeHtml(html, DESCRIPTION_SANITIZE_OPTIONS).trim();
}
