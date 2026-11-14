import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import { headersFile, SECURITY_HEADERS } from './security/headers.mts';

/** Écrit dist/_headers (Netlify, Cloudflare Pages) depuis security/headers.mts. */
function securityHeaders(): Plugin {
  return {
    name: 'last-signal:security-headers',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: '_headers', source: headersFile() });
    },
  };
}

export default defineConfig({
  plugins: [react(), securityHeaders()],
  build: {
    // Aucune source map publiée : le dépôt est public, mais le site n'a pas à les servir.
    sourcemap: false,
    // Pas d'image ni de police inlinée en data: dans le JS ou le CSS.
    assetsInlineLimit: 0,
  },
  // `pnpm build && pnpm preview` sert le site avec la même CSP que la production :
  // un script inline ou une ressource externe y est bloqué comme en ligne.
  preview: { headers: { ...SECURITY_HEADERS } },
});
