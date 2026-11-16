# CLAUDE.md — OrbeMoria

Guide opérationnel permanent pour Claude Code et tout agent de développement. **À lire en entier avant toute tâche.**

## 1. Identité du projet

- **Nom** : OrbeMoria (anciennement « AeroReborn », renommé le 2026-11-16 ; le CDC s'intitule historiquement « Last Signal » ; « COSMOS » est le nom de la palette graphique — aucun de ces noms n'est le nom du produit).
- **Description** : expérience web éducative et publique (frontend React + API Express), qui raconte les équipements laissés sur la **Lune** et sur **Mars**, leur mission, leurs découvertes et ce qu'ils ont transmis. Public principal : 10-15 ans.
- **Devise** : « Chaque machine a laissé plus qu'une trace : elle a transmis quelque chose. »
- **Parcours** : Choose your destination → Hangar (une carte par machine) → la page de la machine : sa vie en **actes calculés depuis ses dates** (Départ, Mission prévue, Prolongations, Silence, Après ; ADR-025). Le récit en 6 étapes (Signal, Why, How, Discovery, Relay, Your turn) n'est plus le parcours principal ; ses routes et contenus sont conservés en attente de décision.
- **Objectifs** : compréhensible sans prérequis · rigueur scientifique sourcée · accessible et mobile-first · livrable pendant le hackathon.

## 2. Stack validée

| Domaine | Choix | Référence |
|---|---|---|
| App | Vite + React 19, racine `frontend/` | ADR-001 |
| Langage | TypeScript strict, frontend **et** backend | ADR-002 |
| Routage | react-router (`src/app/routes.tsx`, URLs via `src/app/paths.ts`), état dans l'URL | ADR-006 |
| Style | Tailwind v4 + tokens COSMOS, primitives shadcn/base-ui | ADR-010 |
| Carte | SVG maison + marqueurs `<button>`, pas de lib cartographique | ADR-007 |
| Données | JSON versionné dans `backend/content/`, validé au démarrage, servi par l'API `/api/*` (`?lang=en` ou `fr`) ; pas de base de données ; médias par référence | ADR-003, ADR-016, ADR-017 |
| i18n | Dictionnaires typés `src/i18n/messages/{en,fr}.ts`, `useTranslation()` | ADR-015 |
| Lint / tests | oxlint · Vitest + Testing Library | ADR-011, ADR-012 |
| CI / hébergement | GitHub Actions (frontend + backend) · hébergement à décider (OPEN-05) | ADR-013 |
| `backend/` | Express 5 + TypeScript : `src/app.ts`, `src/content/` (types, chargement, validation), `src/routes/content.ts` ; `npm run content:check` | ADR-016 |

Commandes (dans `frontend/` **et** `backend/`) : `npm run dev` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` · `npm run check` (les quatre précédentes). Frontend : `npm run preview`. Backend : `npm start`. À créer : `npm run check:links` (US-1.5). **Ne jamais annoncer le résultat d'une commande qui n'existe pas encore.**

## 3. Carte de la documentation (lire ce qui concerne la tâche)

| Besoin | Document |
|---|---|
| Quoi construire, exigences à ID stables | `docs/product/PRD.md` |
| Parcours | `docs/product/USER_FLOWS.md` |
| Stories, statuts, critères | `docs/product/USER_STORIES.md` |
| P0 / P1 / P2 / exclu | `docs/product/SCOPE.md` |
| Structure, composants, routes, carte, récit | `docs/architecture/ARCHITECTURE.md` |
| Schémas JSON, règles de validation | `docs/architecture/DATA_MODEL.md` |
| Décisions et leurs raisons | `docs/architecture/TECHNICAL_DECISIONS.md` |
| Couleurs, polices, contrastes | `docs/design/DESIGN_SYSTEM.md` |
| DoR, DoD, contrôles | `docs/quality/QUALITY_GATES.md` |
| Phases, ordre, plan de réduction | `docs/project/IMPLEMENTATION_PLAN.md` |
| État initial, risques, **décisions ouvertes OPEN-xx** | `docs/project/AUDIT_PHASE0.md` |
| Relecture scientifique du contenu | `docs/content/CONTENT_REVIEW.md` |
| Modèle de fichier de story | `docs/project/stories/_TEMPLATE.md` |

## 4. Méthode (inspirée de BMAD)

L'agent annonce le **rôle** qu'il endosse : *Analyst, PM, UX, Architect, Scrum Master, Dev, QA*. Un rôle Dev n'a pas le droit de modifier le PRD, le périmètre ou l'architecture : il remonte le besoin.

Une tâche de développement = **une story `ready`** de `USER_STORIES.md`. Pas de story → pas de code (sauf correctif trivial explicitement demandé).

## 5. Cycle de travail obligatoire

1. **Understand** — lire la story, les exigences PRD citées, les sections d'architecture et de modèle de données concernées. Vérifier la DoR. Si une `OPEN-xx` liée est ouverte : **s'arrêter et demander**.
2. **Plan** — créer `docs/project/stories/US-x.y.md` depuis le modèle ; lister fichiers touchés, approche, risques, dépendances. Pour une modification importante, **présenter le plan et attendre l'accord** avant d'implémenter.
3. **Implement** — petites modifications, sur une branche `feat/US-x.y-slug` partie de `front`, `back` ou `main` selon la zone touchée (§10). Respecter ARCHITECTURE §3 (emplacements) et §5 (responsabilités).
4. **Verify** — exécuter G1→G4 (QUALITY_GATES §3) + contrôles manuels applicables ; consigner la **sortie réelle** dans le fichier de story.
5. **Document** — mettre à jour les docs impactées ; passer la story en `review`. Seul un humain passe une story en `done`.

## 6. Règles de développement

- Respecter le PRD, le périmètre (SCOPE) et l'architecture validée. **Aucune fonctionnalité hors périmètre** (P1/P2/exclu) sans autorisation écrite.
- **Aucune nouvelle dépendance** sans justification (besoin, alternatives, poids, licence) et accord humain ; la consigner dans une ADR si structurante.
- Composants réutilisables, un par fichier, typés ; pas de duplication (ex. une seule fonction `cn`).
- Aucun texte d'interface en dur : ajouter la clé dans `src/i18n/messages/en.ts` **et** `fr.ts`, puis `t('cle')` via `useTranslation()` (ADR-015).
- Aucune donnée scientifique dans le code : uniquement dans `backend/content/` (servi par l'API).
- **Nature des médias (obligatoire)** : chaque média de l'API a un champ `depiction`. Pour toute valeur autre que `photo` et `document`, l'interface affiche un **badge visible** à côté du média, jamais seulement en infobulle : `artwork` → « Vue d'artiste — pas une photo », `simulation` → « Image de synthèse — pas une photo », `diagram` → « Schéma / carte », `mixed` → « Contient des animations ». Une vue d'artiste ne doit jamais être présentée comme une preuve (PRD MEDIA-001).
- Accessibilité par défaut : éléments natifs (`button`, `a`), focus visible, pas d'info par la couleur seule ni au survol seul, cibles ≥ 44 px, `prefers-reduced-motion` respecté.
- Mobile-first : vérifier à 360 px avant 1440 px.
- Ne pas supprimer de fichier, de fonctionnalité ou de test existant sans validation ; ne pas réécrire l'historique Git ; ne pas pousser sur `main` directement.
- Pas de refactorisation générale non demandée.

## 7. Règles scientifiques (non négociables)

- **Ne jamais inventer** : coordonnées, dates, événements, statuts, relations de transmission, découvertes, citations, témoignages, pensées ou « dernières paroles » de machines ou de personnes.
- Tout fait affiché = `Sourced<T>` avec ≥ 1 `sourceId` existant ; sinon `null` (non affiché).
- Trois voix distinctes : `data` (sourcée, obligatoire), `interpretation` (séparée du fait, sans exagération), `imagination` (invitation, jamais présentée comme un fait).
- Une relation exige `transmitted` + `evidence` + source ; jamais déduite de la seule chronologie.
- Seulement Lune et Mars. Pas d'espace profond, Vesta, Cérès, Éros, orbite solaire ; **pas de Pioneer 10**.
- Sources NASA / NSSDCA vérifiées **individuellement**, avec date de consultation ; ne pas recopier les références du CDC v2 sans contrôle (cas « Apollo 11 LM » pour Apollo 12).
- Un agent peut **structurer** du contenu fourni par l'équipe, ou proposer un brouillon marqué `status: "draft"` avec ses sources ; il ne passe jamais un récit en `reviewed`.
- Pas de logo NASA, pas de formulation « officielle » ; mention : « Independent project, not affiliated with or endorsed by NASA ». Aucun nom, image ou voix de mineur.

## 8. Gestion des modifications

**Avant** toute modification importante : fichiers concernés, changements envisagés, risques, dépendances → présentés au développeur.

**Après** chaque modification : vérifier le fonctionnement, `typecheck` (dès qu'il existe), `lint`, tests pertinents, `build` ; signaler tout problème non résolu.

> **Ne jamais prétendre qu'un test, un lint, un build ou une vérification a réussi s'il n'a pas été exécuté.** Écrire « non exécuté » et pourquoi.

## 9. Escalade — validation humaine obligatoire

S'arrêter, expliquer le changement proposé (problème, options, recommandation) et **attendre l'accord** avant de poursuivre si la tâche modifie :

- le **périmètre fonctionnel** (SCOPE, PRD) ;
- l'**architecture** (structure, routage, état, dépendances, hébergement) ;
- le **modèle de données** (DATA_MODEL, types, statuts) ;
- l'**expérience utilisateur** validée (parcours, actes de la vie d'une machine, hangar) ;
- les **sources scientifiques** ou tout fait publié ;
- ou si une décision `OPEN-xx` est nécessaire.

Toute décision validée est tracée : ADR (technique) ou mise à jour du document produit concerné + clôture de l'`OPEN-xx` dans `AUDIT_PHASE0.md`.

## 10. Git

- Branche par story : `feat/US-x.y-slug` (ou `fix/…`, `docs/…`) ; CI verte obligatoire avant toute fusion.
- **Branches d'intégration (OPEN-11)** : `front` regroupe le travail frontend, `back` le travail backend.
  - Story qui ne touche que `frontend/` → branche partie de `front`, PR vers `front`.
  - Story qui ne touche que `backend/` (API, `backend/content/`) → branche partie de `back`, PR vers `back`.
  - Story qui touche les deux, docs et configuration du dépôt (`docs/`, `.github/`, `CLAUDE.md`) → branche partie de `main`, PR vers `main`.
  - `front` et `back` rejoignent `main` par PR (CI verte, relecture humaine) dès qu'un lot est stable.
  - Après chaque fusion dans `main`, fusionner `main` dans `front` et `back` (merge, jamais de rebase ni de force push) pour éviter les divergences.
- Messages de commit : `type(scope): résumé` (feat, fix, docs, content, test, chore) avec l'ID de story.
- Ne jamais committer de secret ni de `node_modules`.
