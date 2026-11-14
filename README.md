# Last Signal

> Nothing is abandoned. Everything is passed on.

An educational web experience for the NASA Space Apps Challenge 2026, challenge
"Abandoned but not Forgotten". It tells how each retired NASA machine on the Moon, on Mars and in
deep space passed something on to the next one.

_Independent project made for the NASA Space Apps Challenge. Not affiliated with or endorsed by NASA._

## Run

Node 24 and pnpm are required.

```sh
pnpm install     # also installs the git pre-commit hook (lefthook)
pnpm dev         # http://localhost:5173
pnpm check       # format, lint, types, tests, secret scan, build
pnpm build && pnpm preview   # production build served with the production CSP
```

## Security

See [SECURITY.md](SECURITY.md).

## Space agency data

Every fact comes from the NASA resources listed in the challenge (NSSDCA, NASA Science mission
pages), with its access date. _(List completed during the hackathon.)_

## AI usage

Parts of this repository were written with Claude Code (Anthropic) and reviewed by the team:
the project scaffold, the security tooling (`security/`, `scripts/`, `.claude/hooks/`, adapted
from an MIT-licensed training repository by a team member) and the CI configuration. AI-generated
images, if any, carry a visible "AI-generated" watermark.

## License

Code: MIT ([LICENSE](LICENSE)). Third-party resources: [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).
