# Security

Last Signal is a static site: no server, no database, no account, no cookie, no tracker.
The rules come from the project specification (§10) and are enforced by tools, not by memory.

| Rule                            | Enforced by                                                                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| No secret in the repository     | Claude Code hook `secret-guard` (before each write), `pnpm secrets` in the pre-commit hook, gitleaks in CI                                      |
| Every commit is checked         | lefthook pre-commit → `pnpm verify --staged`; `--no-verify`, `-n` and `LEFTHOOK=0` are refused by the `commit-message` hook                     |
| No raw HTML injection (XSS)     | oxlint: `react/no-danger`, `react/jsx-no-script-url`, `no-eval`, `no-new-func`                                                                  |
| Strict CSP and security headers | `security/headers.mts` → `dist/_headers`, `vite preview`, `vercel.json` (tested to be identical)                                                |
| Everything self-hosted          | CSP allows `'self'` only: NASA images, fonts and audio are copied into `public/`                                                                |
| Supply chain                    | exact versions, `minimumReleaseAge` 7 days, install scripts blocked except an allowlist (`pnpm-workspace.yaml`), `pnpm audit` in CI, Dependabot |
| Least privilege in CI           | `permissions: contents: read`, `persist-credentials: false`                                                                                     |
| Privacy of minors               | no personal data collected; no image, voice or name of anyone under 18 in the project                                                           |

Reporting: open a private security advisory on the GitHub repository.
