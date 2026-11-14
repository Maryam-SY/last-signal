import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CONTENT_SECURITY_POLICY, headersFile, SECURITY_HEADERS } from './headers.mts';

interface VercelConfig {
  headers: { source: string; headers: { key: string; value: string }[] }[];
}

describe('security headers', () => {
  it('forbids inline and external scripts, framing and plugins', () => {
    expect(CONTENT_SECURITY_POLICY).toContain("script-src 'self'");
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/unsafe-inline|unsafe-eval|https?:/);
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
    expect(CONTENT_SECURITY_POLICY).toContain("object-src 'none'");
  });

  it('writes every header in the _headers file for all paths', () => {
    const file = headersFile();
    expect(file.startsWith('/*\n')).toBe(true);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      expect(file).toContain(`  ${name}: ${value}\n`);
    }
  });

  it('vercel.json serves exactly the same headers', () => {
    const vercel = JSON.parse(
      readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'),
    ) as VercelConfig;
    const all = vercel.headers.find((rule) => rule.source === '/(.*)');
    const served = Object.fromEntries((all?.headers ?? []).map(({ key, value }) => [key, value]));
    expect(served).toEqual(SECURITY_HEADERS);
  });
});
