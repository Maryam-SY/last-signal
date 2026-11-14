# Phase 1 — lot 1 : TypeScript, thème, routeur, i18n, CI, README

> Fichier de story groupé (demande de l'équipe du 2026-11-14 couvrant plusieurs stories d'E1).
> Rôles : Architect (décisions) + Dev + QA. Branche : `feat/phase1-foundations`. **Statut : review** (rien n'est commité).

## Demande

« Mets tout en TypeScript, on veut un site dynamique (un côté front et un backend), le projet c'est AeroReborn, corrige le thème actuel pour que ça concorde, mets en place les routeurs, la CI, le README, annule le doublon `cn()`, prévois l'internationalisation et évite de coder en dur les textes. »

## Décisions tracées

OPEN-01, 02, 03, 04, 13 tranchées ; OPEN-06 partiellement ; nouvelle OPEN-18 (rôle de l'API) ; ADR-002, 006, 010, 015 acceptées ; ADR-004 remplacée par **ADR-016** (frontend + backend) ; ADR-003 amendée ; ADR-013 : CI acceptée, hébergement à réexaminer. Voir `AUDIT_PHASE0.md §7.1`.

## Critères par story

### US-1.1 — Identité (in-progress)
- [x] `<title>` = AeroReborn — `frontend/index.html`
- [x] README racine (projet, commandes, docs) — `README.md` ; README frontend du template remplacé par un renvoi
- [ ] PDF de référence dans `docs/reference/` — **non fait** (fichiers hors dépôt ; à copier par l'équipe)

### US-1.2 — TypeScript (review)
- [x] Ligne de base avant migration : lint 0 erreur / 1 avertissement, tests 2/2, build OK (84,9 Ko JS gzip)
- [x] Tout `src/` en `.ts`/`.tsx`, `strict: true` (+ `noUncheckedIndexedAccess`), `typecheck` passe — frontend **et** backend
- [x] `components.json` → `tsx: true`
- [x] `cn()` unique : `@/lib/utils` ; paquet npm `cn` désinstallé ; `button.tsx` corrigé
- Ajouts : scripts `check`, `.nvmrc` (24), `engines`, oxlint `typescript` + `jsx-a11y` + `unicorn`

### US-1.3 — Routeur et coquille (review)
- [x] Routes `/`, `/explore/:destinationId`, `/stories/:storyId`, `/about` avec `<h1>` — test `routes.test.tsx`
- [x] `/explore/pluto` et chemins inconnus → 404 avec lien d'accueil — test
- [x] En-tête « Explore » / « About & Sources » avec `aria-current` — test
- [x] Structure conforme à ARCHITECTURE §3 (`app/`, `pages/`, `components/<domaine>/`, `hooks/`, `i18n/`, `styles/`, `types/`)
- Ajouts : lien « Skip to content », titre de document par page, page d'erreur de route, footer avec mention de non-affiliation

### US-1.4 — Thème COSMOS (review)
- [x] Tokens COSMOS (`src/styles/tokens.css`) mappés sur les variables shadcn et exposés à Tailwind (`bg-void`, `text-stellar-cyan`…)
- [x] Space Grotesk, Inter, IBM Plex Mono auto-hébergées (`@fontsource`) ; Geist retiré
- [x] Focus global 2 px Cosmic Indigo ; `prefers-reduced-motion` respecté globalement
- Vérifié dans le navigateur : police des titres = Space Grotesk, fond Void Black

### US-1.6 — CI (review)
- [x] `.github/workflows/ci.yml` : matrice frontend/backend, `npm ci` → lint → typecheck → test → build
- [ ] Exécution réelle sur GitHub — **non vérifiée** (rien n'est poussé)

### Internationalisation (ADR-015)
- [x] Dictionnaires `en` (source) et `fr` typés ; clé manquante = erreur TypeScript ; test d'égalité des clés
- [x] `useTranslation()` / `t('cle', { var })`, repli anglais puis clé, `<html lang>` synchronisé — tests
- [x] Aucun texte visible en dur dans les composants (seule exception : flèches décoratives `←`/`→`)
- Langue par défaut : `en`. Aucun sélecteur de langue (OPEN-06).

### Backend TypeScript (ADR-016)
- [x] `src/app.ts` (app testable) + `src/server.ts` (écoute) ; ESM ; `tsx watch` remplace nodemon
- [x] Tests supertest : `/api/health` 200, 404 JSON — 2/2
- [x] Serveur compilé lancé et interrogé : `{"status":"ok","message":"AeroReborn API running"}`, 404 sur route inconnue
- [x] Proxy Vite `/api` → `http://localhost:3000`

## Vérification (sorties réelles, 2026-11-14)

| Contrôle | Commande | frontend | backend |
|---|---|---|---|
| G1 lint | `npm run lint` | ✅ 0 erreur, 1 avertissement préexistant (`button.tsx` exporte `buttonVariants`, convention shadcn) | ✅ 0 |
| G2 typecheck | `npm run typecheck` | ✅ (sonde : une erreur volontaire est bien détectée) | ✅ |
| G3 test | `npm test` | ✅ 16/16 (routes 10, i18n 6) | ✅ 2/2 |
| G4 build | `npm run build` | ✅ 110,4 Ko JS gzip, 6,4 Ko CSS gzip | ✅ `dist/` |
| G5 CI | GitHub Actions | ⛔ non exécutée (pas de push) | ⛔ idem |
| QG-RESP | navigateur 375 px | ✅ pas de défilement horizontal (scrollWidth = 375) | — |
| QG-A11Y | partiel | ✅ skip link au clavier, focus visible ; Lighthouse **non exécuté** | — |
| Console | navigateur | ✅ aucune erreur | — |

## Fichiers

- Supprimés (remplacés par leur version TS ou par les nouvelles pages) : `frontend/src/App.jsx`, `App.test.jsx` (démo compteur), `main.jsx`, `lib/utils.js`, `test/setup.js`, `vite.config.js`, `jsconfig.json`, `backend/server.js`.
- Conservés sans usage : `frontend/src/App.css`, `frontend/src/assets/*` (restes du template — suppression à valider).
- Dépendances ajoutées — frontend : `react-router`, `@fontsource-variable/space-grotesk`, `@fontsource-variable/inter`, `@fontsource/ibm-plex-mono`, dev `typescript`, `@types/node` ; retirées : `cn`, `@fontsource-variable/geist`. Backend dev : `typescript`, `tsx`, `@types/{node,express,cors,supertest}`, `vitest`, `supertest`, `oxlint` ; retirée : `nodemon`.
- Script d'installation bloqué par npm (`esbuild` postinstall, via `tsx`) : **non approuvé**, non nécessaire (`tsx` fonctionne).

## Problèmes non résolus

- `npm audit` signale des vulnérabilités dans les deux arbres de dépendances (déjà présentes dans les lockfiles d'origine, non analysées ici).
- Port 3000 occupé sur la machine de développement par un autre processus : le proxy Vite pointerait vers lui ; utiliser `PORT` côté backend et `VITE_API_PROXY_TARGET` côté frontend.

## Revue humaine

- Relu par : · Date : · Verdict :
