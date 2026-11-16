# OrbeMoria

> *Every machine left more than a trace: it passed something on.*

OrbeMoria is an educational, interactive web experience about the machines humanity left on the **Moon** and on **Mars**: why they were sent, how they worked, what they helped us learn, and what they passed on to the missions that followed. It is designed first for curious 10–15 year-olds, mobile-first, and every scientific fact shown is linked to a source.

**Independent project, not affiliated with or endorsed by NASA.**

## User journey

1. **Choose your destination** — the Moon or Mars.
2. **Explore** — a simplified 2D map and a gallery of equipment grouped by mission.
3. **Discover the story** — a six-step story: Signal · Why · How · Discovery · Relay · Your turn.

## Repository layout

```
orbemoria/
├── frontend/   React 19 + Vite + TypeScript + Tailwind v4 (UI, routing, i18n)
├── backend/    Node + Express 5 + TypeScript (API)
├── api/        Vercel Function entry: serves the compiled backend under /api
├── docs/       Product, architecture, design, quality and project documentation
├── .github/    CI workflow (lint, typecheck, test, build for both packages)
└── CLAUDE.md   Working rules for AI coding agents
```

## Prerequisites

- Node.js 24 (see `.nvmrc`) and npm.

## Getting started

Install each package:

```bash
cd frontend && npm ci
```

```bash
cd backend && npm ci
```

Run the API (port 3000 by default, configurable with `PORT` in `backend/.env`):

```bash
cd backend && npm run dev
```

Run the web app (Vite dev server; `/api/*` is proxied to `http://localhost:3000`, override with `VITE_API_PROXY_TARGET`):

```bash
cd frontend && npm run dev
```

The web app reads all mission content from the API (`/api/*`), so start the backend first. In production, set `VITE_API_BASE_URL` (e.g. `https://api.example.org`) at build time; when it is empty, the app calls `/api` on its own origin.

## Scripts

Available in both `frontend/` and `backend/`:

| Script | Purpose |
|---|---|
| `npm run dev` | Development server (Vite / `tsx watch`) |
| `npm run lint` | oxlint |
| `npm run typecheck` | TypeScript, strict, no emit |
| `npm test` | Vitest |
| `npm run build` | Production build (`dist/`) |
| `npm run check` | lint + typecheck + test + build — run before opening a PR |
| `npm run sitemap` | Frontend only: rebuilds `public/sitemap.xml` from `backend/content` (also run before every build) |

Frontend only: `npm run preview` serves the production build. Backend only: `npm start` runs the compiled server.

## Deployment (Vercel)

The whole site — static frontend and API — is one Vercel project ([ADR-026](docs/architecture/TECHNICAL_DECISIONS.md)). Everything is configured in `vercel.json`; no environment variable is needed.

1. Sign in on [vercel.com](https://vercel.com) with GitHub and choose **Add New → Project**.
2. Import this repository. Keep the **root directory** as the repository root and the framework preset as **Other** (the build, install and output settings come from `vercel.json`).
3. Deploy. Every push to `main` then deploys to production; every pull request gets a preview URL.

Check after a deploy: `https://<your-project>.vercel.app/api/health` answers `{"status":"ok"}`, and reloading `/explore/moon` shows the page.

## Internationalisation

All interface text lives in `frontend/src/i18n/messages/` (`en.ts` is the source, `fr.ts` must provide the same keys — enforced by TypeScript and a test). Components never hard-code visible text: they call `t('some.key')` from `useTranslation()`. Scientific content will live in data files, not in the UI dictionaries.

## Documentation

| Topic | Document |
|---|---|
| Product requirements | [docs/product/PRD.md](docs/product/PRD.md) |
| Scope (P0 / P1 / P2) | [docs/product/SCOPE.md](docs/product/SCOPE.md) |
| User flows and stories | [docs/product/USER_FLOWS.md](docs/product/USER_FLOWS.md), [docs/product/USER_STORIES.md](docs/product/USER_STORIES.md) |
| Architecture and decisions | [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md), [docs/architecture/TECHNICAL_DECISIONS.md](docs/architecture/TECHNICAL_DECISIONS.md) |
| Data model | [docs/architecture/DATA_MODEL.md](docs/architecture/DATA_MODEL.md) |
| Design system (« Cosmic Knowledge » palette) | [docs/design/DESIGN_SYSTEM.md](docs/design/DESIGN_SYSTEM.md) |
| Quality gates | [docs/quality/QUALITY_GATES.md](docs/quality/QUALITY_GATES.md) |
| Plan and open decisions | [docs/project/IMPLEMENTATION_PLAN.md](docs/project/IMPLEMENTATION_PLAN.md), [docs/project/AUDIT_PHASE0.md](docs/project/AUDIT_PHASE0.md) |

## Contributing

One branch per story (`feat/US-x.y-short-name`) and a green CI before merging. Frontend-only work goes through the `front` integration branch, backend-only work through `back`; cross-cutting work and docs target `main` directly. `front` and `back` reach `main` through a pull request, and `main` is merged back into both after every merge. See [CLAUDE.md](CLAUDE.md) for the full workflow and the scientific-accuracy rules (no invented coordinates, dates, statuses, relations or quotes; every fact has a source).

## Security

No secret in the repository, no raw HTML injection, dependency audit and gitleaks in CI: see [SECURITY.md](SECURITY.md). Check locally with `npm run secrets` from the repository root.

## License

[MIT](LICENSE), © 2026 Ndeye Marième Sy (Maryam-SY). Third-party licenses (fonts, images, libraries) will be listed in `THIRD_PARTY_LICENSES.md` and on the site's About page.
