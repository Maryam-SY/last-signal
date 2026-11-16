# Security

OrbeMoria is a static site (`frontend/`) with a small read-only API (`backend/`, Express): no
database, no account, no cookie, no tracker. Preferences (language, sound) and the explorer's
notebook stay in the visitor's browser (`localStorage`) and are never sent anywhere.

The rules below are enforced by tools, not by memory. They come from the original « Last Signal »
scaffold (branch `archive/last-signal-scaffold`), adapted to this repository.

| Rule                        | Enforced by                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| No secret in the repository | `npm run secrets` (`scripts/scan-secrets.mts`, Node only, no dependency) and gitleaks on the whole history, in CI |
| No raw HTML injection (XSS) | oxlint, frontend: `react/no-danger`, `react/jsx-no-script-url`, `no-eval`, `no-new-func`                          |
| No code built from strings  | oxlint, backend: `no-eval`, `no-new-func`                                                                         |
| Supply chain                | lockfiles + `npm ci`, `npm audit --audit-level high` for frontend and backend, in CI                              |
| Least privilege in CI       | `permissions: contents: read`, `persist-credentials: false`                                                       |
| Privacy of minors           | no personal data collected; no image, voice or name of anyone under 18 in the project                             |

Run the secret checks locally, from the repository root:

```bash
npm run secrets
```

```bash
npm run test:scripts
```

## Not in place yet

These protections existed in the « Last Signal » scaffold but are not active here; each needs a
team decision before it is added:

- Content-Security-Policy and security headers (the scaffold's `security/headers.mts`; media are
  currently loaded by reference from NASA hosts, so the policy must allow them).
- Git pre-commit hook (lefthook: a new dependency) and Claude Code hooks (`.claude/hooks/`).
- Dependabot security updates (`.github/dependabot.yml`).

## Reporting

Open a private security advisory on the GitHub repository.
