# Audit Phase 0 — AeroReborn

> Date : 2026-11-14 · Auteur : agent Claude Code (rôles BMAD : Analyst + Architect) · Statut : **en attente de validation**
>
> Ce document fige l'état du dépôt au début du projet, l'analyse d'écart avec le cahier des charges et la liste des **décisions ouvertes (`OPEN-xx`)** référencées dans toute la documentation.

## 1. Sources lues

| Document | Emplacement | Rôle |
|---|---|---|
| `Last_Signal_Cahier_des_charges_v3_UX.pdf` (v3.0, 13 p., 14/11/2026) | fourni hors dépôt (`Downloads/`) | **Source de vérité** fonctionnelle et UX |
| `identite_visuelle_cosmos_couleurs_typographies.pdf` (2 p.) | fourni hors dépôt | Palette et typographies (« COSMOS · Explore Beyond ») |
| BMAD Method (README + docs.bmad-method.org) | web | Méthode de cadrage (voir §6) |

> ⚠️ Les deux PDF ne sont pas versionnés. Recommandation : les copier dans `docs/reference/` (voir OPEN-01 / tâche P1-01) pour que tout agent puisse les relire.

## 2. État initial du dépôt

### 2.1 Git

- Remote : `origin` → `github.com/biramth/aeroreborn`
- Branche courante : `main`, propre, à jour avec `origin/main`.
- Historique : 2 commits (`586b4f4` Initial commit, `0f7dbcc` feat: add frontend … and backend …), tous deux du 14/11/2026.
- Branches `front` et `back` (locales et distantes) **pointent sur le même commit que `main`** : aucune divergence.

### 2.2 Structure

```
aeroreborn/
├── LICENSE                     MIT (2026, Pape Birame Thiombane)
├── backend/                    Node/Express (CommonJS)
│   ├── package.json            express 5, cors, dotenv, nodemon
│   └── server.js               une seule route GET /api/health
└── frontend/                   Application Vite + React (JavaScript)
    ├── package.json            nom "aeroreborn"
    ├── index.html              <title>aerofront</title>, lang="en"
    ├── vite.config.js          React + Tailwind v4, alias @ → src, config Vitest (jsdom)
    ├── jsconfig.json           alias @/*
    ├── components.json         shadcn (style base-nova, tsx:false, base neutral)
    ├── .oxlintrc.json          oxlint (plugins react, oxc)
    ├── src/
    │   ├── main.jsx, App.jsx   page de démo (compteur + logo)
    │   ├── App.test.jsx        2 tests sur la page de démo
    │   ├── App.css             CSS du template Vite, non importé (mort)
    │   ├── index.css           Tailwind + thème shadcn neutre clair/sombre, police Geist
    │   ├── components/ui/button.jsx   Button shadcn sur @base-ui/react
    │   ├── lib/utils.js        cn() = clsx + tailwind-merge
    │   ├── test/setup.js       jest-dom
    │   └── assets/             hero.png, react.svg, vite.svg (template)
    └── README.md               README du template Vite
```

### 2.3 Technologies identifiées

| Domaine | Présent | Versions (package.json) |
|---|---|---|
| Build | Vite | ^8.3.6 |
| UI | React, React DOM | ^19.3.1 |
| Langage | **JavaScript** (JSX) | — |
| Style | Tailwind CSS v4 (`@tailwindcss/vite`), tw-animate-css | ^4.3.5 |
| Composants | shadcn (CLI ^4.23), @base-ui/react ^1.9, lucide-react, class-variance-authority | — |
| Lint | **oxlint** (pas ESLint) | ^1.90.0 |
| Tests | Vitest + Testing Library + jsdom | vitest ^5.1.0 |
| Backend | Express 5, cors, dotenv | — |
| CI/CD | **aucun** (pas de `.github/`) | — |
| Environnement local | Node v24.22.2, npm 11.19.1 | — |

Scripts réellement disponibles (`frontend/package.json`) : `dev`, `build`, `lint` (oxlint), `preview`, `test` (vitest run), `test:watch`. **Aucun script `typecheck`.**

`node_modules` n'est installé ni dans `frontend/` ni dans `backend/` : **aucune commande (lint, test, build) n'a pu être exécutée pendant cet audit**, et la consigne de phase 0 interdit l'installation. La première tâche de la phase 1 est d'établir cette ligne de base.

## 3. Analyse d'écart avec le cahier des charges

### 3.1 Déjà présent et conforme

- Vite + React (stack de référence §9 du CDC).
- Tailwind (option « CSS simple ou Tailwind »).
- Vitest + Testing Library utilisables pour les tests d'interaction.
- Un linter configuré (oxlint).
- `LICENSE` à la racine.

### 3.2 Contradictions

| # | Constat dans le dépôt | Exigence du CDC | Gravité | Décision |
|---|---|---|---|---|
| C1 | Code en **JavaScript** (`.jsx`, `jsconfig`, `tsx:false`) | Vite + React + **TypeScript** (§9) | Haute | OPEN-02 |
| C2 | **Backend Express** présent | « application statique : aucun serveur ni base de données n'est nécessaire pour le MVP » (§7) | Moyenne | OPEN-03 |
| C3 | Trois noms : « AeroReborn » (consigne, package), « Last Signal » (CDC), « COSMOS · Explore Beyond » (identité visuelle), « aerofront » (`<title>`) | Nom officiel : **AeroReborn** | Moyenne | OPEN-01 |
| C4 | Thème shadcn **neutre clair** + police **Geist** | Identité COSMOS : fond sombre, Space Grotesk / Inter / IBM Plex Mono | Moyenne | OPEN-13 |
| C5 | Lint = oxlint | CDC : « GitHub Actions pour lint, typage et build » (outil non imposé) ; consigne : « ESLint si configuré » | Faible | ADR-011 : garder oxlint |

### 3.3 Absent (à créer)

- Routage (pages Explore, Destination, Story, About) — aucun routeur installé.
- Dossier `content/` et tout le contenu scientifique (destinations, missions, équipements, récits, relations, sources). **Aucune donnée n'existe.**
- Types de domaine, chargement et validation du contenu.
- Carte, galerie, fiches, récit, page About.
- `README.md` racine, `THIRD_PARTY_LICENSES.md`, `public/images/`.
- CI GitHub Actions, configuration de déploiement.
- Script `typecheck`.

### 3.4 Incomplet / dette

- `App.jsx` / `App.test.jsx` : démo à remplacer (les 2 tests du compteur disparaîtront avec elle).
- `App.css` et `src/assets/*` : restes du template, non utilisés (suppression à valider en phase 1, **non supprimés ici**).
- `button.jsx` importe `cn` depuis le paquet npm `cn` (paquet shadcn, légitime) alors que `src/lib/utils.js` définit aussi `cn()` : **deux implémentations** pour la même fonction. À unifier en phase 1.
- `frontend/README.md` = README générique du template.

## 4. Analyse du cahier des charges — points d'attention

1. **Granularité « mission »** (OPEN-16). « Une histoire principale par mission », mais les récits recommandés sont « Surveyor 3 et Apollo 12 » (deux missions distinctes, liées par une relation) et « Spirit et Opportunity » (deux rovers ; selon les référentiels, une ou deux missions). Le modèle de données doit permettre à un récit de mission de référencer des équipements d'une **autre** mission.
2. **Fil d'Ariane vs pages** : le fil `Explore → Moon/Mars → Mission → Équipement → Story` mentionne « Mission » et « Équipement » qui ne sont **pas** des pages dans la liste recommandée (Explore, Destination, Story, About). Proposition : Mission = section ancrée de la page Destination, Équipement = panneau de détail adressable par URL (`?machine=`). Voir ARCHITECTURE §4.
3. **Filtres** : « Filtres simples » figurent dans les composants de l'écran 2 mais pas dans la liste P0, et « Filtres complémentaires » sont en P1 (OPEN-14).
4. **Langue** : les libellés d'exemple sont en anglais (« Explore the Moon », « Discover its story ») et la « langue française complète » est en P2 → l'interface MVP serait en anglais, alors que la documentation et l'équipe sont francophones (OPEN-06).
5. **Relations sur la carte** : explicitement non tranché par le CDC (OPEN-09).
6. **Catalogue** : le CDC interdit d'annoncer un total tant que la liste Lune/Mars n'est pas validée et dédoublonnée (OPEN-07).
7. **Point de vigilance documentaire** : la référence NSSDCA « Apollo 11 LM » du CDC v2 ne doit pas étayer un récit Apollo 12. Toutes les sources du v2 sont à revérifier une par une.
8. **Personnes mineures** : aucun nom, image ou voix de mineur dans le projet ou la démo.

## 5. Risques

| ID | Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Contenu scientifique** non prêt à temps (recherche, sourçage, vérification) | Haute | Critique | Piste « contenu » parallèle dès la phase 1 ; galerie livrable avec peu de données ; validation automatique des sources |
| R2 | Erreur factuelle ou source inadaptée (ex. Apollo 11 vs 12) | Moyenne | Haute | Type `Sourced<T>`, test d'intégrité, relecture croisée humaine (QG-SCI) |
| R3 | Carte interactive chronophage / peu accessible | Moyenne | Haute | Galerie d'abord (fallback natif), carte ensuite ; marqueurs = boutons focusables |
| R4 | Coordonnées imprécises présentées comme exactes | Moyenne | Haute | Mention « schématique », `coordinates: null` autorisé, précision documentée |
| R5 | Migration TS + mise en place tardive de la CI | Moyenne | Moyenne | Faire en phase 1 tant que le code fait < 10 fichiers |
| R6 | Déploiement découvert le dernier jour | Moyenne | Haute | Déployer le squelette dès la phase 1 |
| R7 | Licences d'images / fonds de carte non conformes | Moyenne | Moyenne | Crédit et licence obligatoires dans le modèle `Media` ; THIRD_PARTY_LICENSES |
| R8 | Dérive du périmètre (animations, 3D, quiz…) | Haute | Moyenne | SCOPE.md + règle CLAUDE.md « pas de hors périmètre sans validation » |
| R9 | Branches `front`/`back` utilisées en parallèle → conflits | Moyenne | Moyenne | OPEN-11 : trunk-based + branches courtes par story |
| R10 | Échéance du hackathon inconnue → plan non calibré | — | Haute | OPEN-12 |

## 6. Application de la méthode BMAD

La BMAD Method est en transition (v6.12 stable, v7 alpha dont la documentation « change souvent »). **Nous n'installons pas l'outillage BMAD** (interdit en phase 0 et non indispensable) ; nous en reprenons les principes stables :

| Principe BMAD | Application dans AeroReborn |
|---|---|
| Rôles spécialisés (Analyst, PM, UX, Architect, Product Owner/SM, Dev, QA) | Chaque document indique le rôle qui le porte ; `CLAUDE.md` impose à l'agent de déclarer le « chapeau » qu'il porte |
| Artefacts de planification versionnés (brief → PRD → UX → architecture → epics/stories) | `docs/product/*`, `docs/architecture/*`, `docs/project/*` |
| Exigences à identifiants stables, FR et NFR séparés | `PRD.md` : préfixes fonctionnels (`DEST-`, `MAP-`…) et `NFR-*` |
| Epics découpés en stories ordonnées, chaque story trace ses exigences | `USER_STORIES.md` (epics E1–E5, stories `US-x.y`) |
| Fichier de story porteur du contexte pour l'agent de dev (tâches, notes, journal) | `docs/project/stories/_TEMPLATE.md` |
| Contexte projet permanent pour les agents | `CLAUDE.md` |
| Porte de « readiness » : aucune story ne dépend d'une décision non enregistrée | Definition of Ready dans `QUALITY_GATES.md` + revue de readiness en fin de phase 0 |
| Revue de code et rétrospective | Gate de revue + rétro de fin de phase dans `IMPLEMENTATION_PLAN.md` |

## 7. Décisions ouvertes (à valider par l'équipe)

Chaque décision a une **recommandation** ; tant qu'elle n'est pas validée, les stories qui en dépendent ne sont pas « Ready ».

### 7.1 Journal des décisions prises

| Date | OPEN | Décision de l'équipe | Trace |
|---|---|---|---|
| 2026-11-14 | OPEN-01 | Nom unique **AeroReborn** (titre, README, interface). | US-1.1 |
| 2026-11-14 | OPEN-02 | **Tout en TypeScript strict** (frontend **et** backend). | ADR-002 |
| 2026-11-14 | OPEN-03 | **Site dynamique : frontend + backend.** Le backend Express n'est plus gelé ; il est migré en TypeScript et contrôlé en CI. Son rôle fonctionnel reste à définir → **OPEN-18**. | ADR-016 (remplace ADR-004, amende ADR-003) |
| 2026-11-14 | OPEN-04 | Routeur mis en place (react-router). | ADR-006 |
| 2026-11-14 | OPEN-06 | **Internationalisation prévue** : aucun texte d'interface en dur, dictionnaires typés `en` (défaut) et `fr`. Le choix de la langue affichée par défaut et d'un sélecteur de langue reste ouvert. | ADR-015 |
| 2026-11-14 | OPEN-13 | Thème corrigé : palette COSMOS (sombre), Space Grotesk / Inter / IBM Plex Mono, Geist retiré. | ADR-010 |
| 2026-11-14 | OPEN-08 | **4 histoires** choisies par l'équipe (document « Appareils et missions ») : Apollo 11 + réflecteurs, Surveyor 3 + Apollo 12, Spirit + Opportunity, Ingenuity (Ingenuity passe de P1 à P0). | `backend/content/stories/` |
| 2026-11-14 | OPEN-16 | Une mission par entrée NSSDCA, sauf **Spirit et Opportunity regroupés** en « Mars Exploration Rovers » (histoire commune) ; un récit peut appartenir à **plusieurs missions** (`missionIds`). | DATA_MODEL |
| 2026-11-14 | OPEN-18 | **Le backend sert le contenu** : JSON versionnés dans `backend/content/`, lus au démarrage, validés (le serveur refuse de démarrer en cas d'erreur), exposés en lecture seule par `/api/*` avec `?lang=en` ou `?lang=fr`. Pas de base de données. | ADR-016, ARCHITECTURE §16 |
| 2026-11-14 | — | Médias stockés **par référence** (URL + crédit + page source), pas de fichiers dans le dépôt (proposé). | ADR-017 |

### 7.2 Liste des décisions

| ID | Sujet | Recommandation | Bloque |
|---|---|---|---|
| OPEN-01 | ✅ **Tranchée** (§7.1) — Nom et identité | AeroReborn. Reste à faire : copier les PDF dans `docs/reference/`. | US-1.1 |
| OPEN-02 | ✅ **Tranchée** (§7.1) — Migration TypeScript | Fait (frontend + backend). | E1 |
| OPEN-03 | ✅ **Tranchée** (§7.1) — Backend Express | Actif, en TypeScript ; rôle → OPEN-18. | ADR-016 |
| OPEN-04 | ✅ **Tranchée** (§7.1) — Routeur | react-router, `createBrowserRouter`. | US-1.3 |
| OPEN-05 | Hébergement | **À réexaminer avec OPEN-18** : un backend doit être hébergé en plus du frontend. Options : (a) Vercel pour le front + Render/Railway/Fly.io pour l'API ; (b) un seul service Node qui sert l'API **et** le build du front. | US-1.7 |
| OPEN-06 | 🟡 **Partiellement tranchée** (§7.1) — Langue | i18n en place (`en`, `fr`). Restent à décider : langue par défaut affichée et présence d'un sélecteur de langue (le français complet du contenu scientifique reste P2 dans le CDC). | E2–E4 |
| OPEN-07 | 🟡 **Partiellement tranchée** — catalogue initial : 6 missions et 11 équipements liés aux 4 histoires (`backend/content/`) ; reste à compléter et à valider le total. Liste exacte des équipements Lune/Mars et total affiché ; inclusion ou non des missions non-NASA (le CDC parle d'« équipements humains », sans restreindre à la NASA) | Fixée par la piste contenu (US-1.8) puis validée par l'équipe ; aucun total affiché avant. | DEST-002, E3 |
| OPEN-08 | ✅ **Tranchée** (§7.1) — Missions disposant d'un récit complet dans le MVP | **Apollo 12** (avec Surveyor 3) et **Mars Exploration Rover** (Spirit/Opportunity, relais Sojourner), conformément au CDC. | E4 |
| OPEN-09 | Relations : carte, récits ou les deux | **Récits (étape Relais) + fiche détail en P0** ; tracés sur la carte en P1. | MAP-007 |
| OPEN-10 | Technique d'animation narrative | **Reportée volontairement** (CDC). Le moteur de récit est conçu indépendamment (ADR-014). | — |
| OPEN-11 | Stratégie de branches | Trunk-based sur `main`, branches courtes `feat/US-x.y-slug`, PR + CI obligatoire. `front`/`back` laissées en l'état (identiques à `main`). | Process |
| OPEN-12 | Échéance du hackathon et répartition de l'équipe | **Information manquante** : nécessaire pour calibrer le plan. | Plan |
| OPEN-13 | ✅ **Tranchée** (§7.1) — Polices et thème | Fait : thème COSMOS, polices auto-hébergées via `@fontsource`. | US-1.4 |
| OPEN-14 | Filtre par mission : P0 ou P1 ? | **P0 léger** : barre de saut vers les groupes de mission (ancres). Filtre par statut en P1. | US-3.5 |
| OPEN-15 | Fonds de carte (source, licence, projection) | Mosaïques globales équirectangulaires NASA/USGS du domaine public, réduites ; licence vérifiée par la piste contenu. | US-3.3 |
| OPEN-16 | ✅ **Tranchée** (§7.1) — Granularité « mission » | Une entrée `Mission` par mission référencée dans NSSDCA ; un récit de mission peut référencer des équipements d'autres missions via `machineIds` et `relationIds`. Le regroupement Spirit/Opportunity est à trancher avec les sources. | DATA_MODEL |
| OPEN-17 | Validation du contenu : `zod` en devDependency | **Oui**, uniquement dans les tests (aucun impact sur le bundle). Si le contenu passe par l'API (OPEN-18), zod sert aussi à valider les réponses côté backend. | US-1.5 |
| OPEN-18 | ✅ **Tranchée** (§7.1) — **Rôle du backend** : (1) quel contenu sert-il (tout le catalogue, les récits, rien pour l'instant) ? (2) où vit le contenu (JSON versionnés lus par l'API, ou base de données) ? (3) hébergement de l'API | Recommandation : l'API lit les **JSON versionnés** de `content/` (déplacé à la racine ou dans `backend/`) et les expose en lecture seule (`GET /api/destinations`, `/api/destinations/:id/missions`, `/api/machines/:id`, `/api/stories/:id`, `/api/sources`) ; **pas de base de données** dans le MVP (traçabilité scientifique par PR conservée). Le frontend garde un repli sur la galerie si l'API ne répond pas. | US-1.5, E3, E4, ADR-016 |
