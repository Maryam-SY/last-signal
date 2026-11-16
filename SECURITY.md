# Security

OrbeMoria is a static site (`frontend/`) with a small read-only API (`backend/`, Express): no
database, no account, no cookie, no tracker. Preferences (language, sound) and the explorer's
notebook stay in the visitor's browser (`localStorage`) and are never sent anywhere.

The rules below are enforced by tools, not by memory. They come from the original « Last Signal »
scaffold (branch `archive/last-signal-scaffold`), adapted to this repository.

| Rule                        | Enforced by                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| No secret in the repository | `npm run secrets` (`scripts/scan-secrets.mts`, Node only, no dependency) and gitleaks on the whole history, in CI |
| Every commit is checked     | lefthook pre-commit (`lefthook.yml`): secret scan of the staged content, lint and types of the part that changed; never `--no-verify` |
| Strict CSP and security headers | `frontend/src/security/headers.ts` → `vite preview` and `vercel.json` (tested to be identical); only NASA media servers are allowed as external origins, and a test checks every media of `backend/content/` against them |
| No raw HTML injection (XSS) | oxlint, frontend: `react/no-danger`, `react/jsx-no-script-url`, `no-eval`, `no-new-func`                          |
| No code built from strings  | oxlint, backend: `no-eval`, `no-new-func`                                                                         |
| Supply chain                | lockfiles + `npm ci`, exact versions for new tools, `npm audit --audit-level high` for frontend and backend in CI, Dependabot (security updates for npm, weekly updates for GitHub Actions) |
| Least privilege in CI       | `permissions: contents: read`, `persist-credentials: false`                                                       |
| Privacy of minors           | no personal data collected; no image, voice or name of anyone under 18 in the project                             |

Set up the pre-commit hook once, from the repository root (it also needs `npm ci` in `frontend/` and `backend/`):

```bash
npm install
```

Run the secret checks by hand:

```bash
npm run secrets
```

```bash
npm run test:scripts
```

## Content-Security-Policy

External origins are limited to the NASA servers the sourced media come from (ADR-017): pictures
(`img-src`), MP4 videos (`media-src`) and 3D models (`connect-src`). Two exceptions to a fully
strict policy, both deliberate:

- `'wasm-unsafe-eval'` in `script-src`: lets the self-hosted Draco decoder (`public/draco/`) compile
  its WebAssembly for the 3D models. It does not allow JavaScript `eval`.
- `'unsafe-inline'` in `style-src`: style attributes and the shadow DOM of `<model-viewer>`. Scripts
  stay strict (`'self'` only, no inline script).

To show a media from a new NASA server, add the host to `frontend/src/security/headers.ts` and to
`vercel.json` (`images.remotePatterns`): the tests fail until both agree.

## Reporting

Open a private security advisory on the GitHub repository.
