/**
 * En-têtes HTTP de sécurité (cahier des charges §10.2). Source unique : le build les écrit dans
 * dist/_headers (Netlify, Cloudflare Pages), `vite preview` les sert, et un test vérifie que
 * vercel.json contient exactement les mêmes.
 *
 * Tout est auto-hébergé (images NASA, polices, audio) : aucune origine externe n'est autorisée.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "media-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
};

/** Le fichier `_headers` de Netlify et Cloudflare Pages. */
export function headersFile(): string {
  const lines = Object.entries(SECURITY_HEADERS).map(([name, value]) => `  ${name}: ${value}`);
  return ['/*', ...lines, ''].join('\n');
}
