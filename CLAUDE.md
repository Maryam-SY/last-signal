# CLAUDE.md

Last Signal : expérience web éducative (NASA Space Apps 2026, défi « Abandoned but not Forgotten »).
Site statique Vite + React + TypeScript, un seul package. Pas de serveur, pas de base, pas de compte.

## Méthodologie

- Le périmètre est celui du cahier des charges v2 (MVP M1–M7). Une coupe de périmètre se décide par le rôle A, pas par l'agent.
- `pnpm verify` avant chaque commit (lefthook le lance). Jamais de `--no-verify`.
- Une tâche = un commit Conventional Commits : `feat(map): add mars panel`.

## Architecture

- `content/` : machines, histoires, sources (JSON). Le contenu est séparé du code.
- `src/pages/`, `src/components/` : interface. `src/i18n/` : tous les textes visibles.
- `security/headers.mts` : source unique des en-têtes HTTP (CSP). `vercel.json` doit rester identique (testé).
- `.claude/hooks/` : garde-fous de Claude Code (secrets, commits, vérification de fin de tour).

## Bonnes pratiques

- Sécurité : voir `SECURITY.md`. Jamais de `dangerouslySetInnerHTML`, de `eval`, de script inline ni de ressource externe : tout est auto-hébergé dans `public/`.
- Aucun secret côté front : un site statique n'en a pas besoin.
- Exactitude : aucun chiffre de mémoire. Chaque fait a une voix (data, interpretation, imagination) et une source officielle (NSSDCA, NASA Science) avec sa date de consultation.
- Aucun texte visible écrit en dur dans un composant : il va dans `src/i18n/`.
- Accessibilité : focus visible, contraste 4,5:1, navigation clavier, `prefers-reduced-motion`.
- Code ou données générés par IA : le signaler dans le README (section AI usage).
- Aucun logo NASA, aucune personne de moins de 18 ans, aucune donnée personnelle.

## Nommage

- Fichiers en kebab-case : `home-page.tsx`, `scan-secrets.mts`. Composants en PascalCase : `HomePage`.
- Tests à côté du code : `headers.test.mts`, titres en anglais.
