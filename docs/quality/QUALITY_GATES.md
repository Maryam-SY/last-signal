# Quality Gates — AeroReborn

> Rôle BMAD : QA / Test Architect · Version 1.0 (Phase 0) · Statut : **en attente de validation**
> Les commandes s'exécutent dans `frontend/` **et** dans `backend/` (mêmes noms de scripts). Légende : ✅ **existe aujourd'hui** dans `package.json` · 🛠 **à créer** (story indiquée) — tant qu'il n'existe pas, le gate correspondant est déclaré « non exécutable » et **ne peut pas être annoncé comme réussi**.

## 0. Règle d'or

> Un contrôle non exécuté est **non vérifié**, jamais « réussi ». Tout rapport d'agent liste les commandes lancées et leur résultat réel (code de sortie, nombre de tests, erreurs).

## 1. Definition of Ready (DoR)

Une story passe en `ready` seulement si :

- [ ] Elle référence ≥ 1 exigence du PRD et ses critères sont vérifiables.
- [ ] Aucune décision `OPEN-xx` dont elle dépend n'est ouverte.
- [ ] Ses dépendances (stories, contenu, assets) sont `done` ou disponibles en fixtures.
- [ ] Les fichiers/dossiers impactés sont identifiés (ARCHITECTURE §3).
- [ ] Les gates applicables (§3) sont listés dans son fichier de story.

## 2. Definition of Done (DoD)

Une story passe en `review` quand l'agent a :

- [ ] Satisfait **tous** ses critères d'acceptation (cochés un par un dans le fichier de story, avec preuve).
- [ ] Exécuté les gates automatiques **G1 à G4** avec succès (sortie consignée).
- [ ] Exécuté les gates manuels applicables (§3) et consigné le résultat.
- [ ] Ajouté ou mis à jour les tests couvrant le comportement livré.
- [ ] Mis à jour la documentation impactée (PRD, DATA_MODEL, ADR…) ou indiqué « aucune ».
- [ ] Listé les problèmes non résolus.

Elle passe en `done` après **relecture humaine** et fusion sur `main` avec CI verte.

## 3. Catalogue des contrôles

### Contrôles automatiques (bloquants pour toute story de code)

| ID | Contrôle | Comment | Résultat attendu | Validation |
|---|---|---|---|---|
| **G1 — QG-LINT** | Lint (règles React hooks, puis jsx-a11y + TS — ADR-011) | ✅ `npm run lint` | Code de sortie 0 | 0 erreur ; avertissements nouveaux justifiés dans la PR |
| **G2 — QG-TYPE** | Typage TypeScript strict | ✅ `npm run typecheck` (= `tsc --noEmit`) | Code de sortie 0 | 0 erreur ; aucun `any`/`@ts-ignore` nouveau sans commentaire justifié |
| **G3 — QG-TEST** | Tests unitaires, composants et intégrité du contenu | ✅ `npm test` (= `vitest run`) | Tous les tests passent | 0 échec, 0 test `.skip`/`.only` ajouté |
| **G4 — QG-BUILD** | Build de production | ✅ `npm run build` | `dist/` généré, code 0 | Aucune erreur ; taille JS initiale rapportée (cible NFR-PERF-002) |
| **G5 — QG-CI** | Les mêmes contrôles en CI | ✅ `.github/workflows/ci.yml` (matrice frontend/backend) | Check vert sur la PR | Fusion interdite si rouge |
| ✅ `npm run check` | Raccourci `lint && typecheck && test && build` | Dans chaque paquet | — | Commande unique que l'agent lance avant `review` |

### Contrôles de données et de science

| ID | Contrôle | Comment | Résultat attendu | Validation |
|---|---|---|---|---|
| **QG-DATA** | Cohérence des JSON (règles V1–V12 de DATA_MODEL §5) | ✅ inclus dans `npm test` dès US-1.5 (`content-integrity.test.ts`) | 0 erreur ; avertissements listés | Bloquant pour tout changement dans `content/` |
| **QG-SCI** | Exactitude scientifique | **Manuel**, par une personne différente du rédacteur : pour chaque fait, ouvrir la source et vérifier valeur, unité, date, mission, équipement ; vérifier la séparation des voix ; aucune citation ou pensée inventée ; aucun objet hors Lune/Mars | Fiche de relecture dans la PR (liste des faits vérifiés, OK/KO) | Récit passé en `status: "reviewed"` seulement après 0 KO |
| **QG-LINKS** | Liens des sources joignables | 🛠 `npm run check:links` (script Node sans dépendance qui interroge chaque `url` de `sources.json`, US-1.5) ; à défaut, vérification manuelle | 100 % des URL en 2xx/3xx | Non bloquant en CI (réseau instable), **bloquant avant release** |
| **QG-LEGAL** | Droits et transparence | Manuel : chaque média a `creditId` (vérifié aussi par V12) ; recherche « nasa » et « logo » dans `public/` ; phrase de non-affiliation présente ; mention « AI-generated » si applicable ; aucun mineur | Checklist cochée | Bloquant avant release |

### Contrôles d'expérience (manuels, sur `npm run dev` ou `npm run preview`, puis sur l'URL déployée)

| ID | Contrôle | Comment | Résultat attendu | Validation |
|---|---|---|---|---|
| **QG-INT** | Interactions principales | Tests RTL automatisés (inclus dans G3) **+** vérification manuelle : choix destination ; sélection marqueur → carte galerie ; sélection carte → marqueur ; ouverture/fermeture fiche (Échap, focus restauré) ; récit Next/Previous/étape directe/Exit ; SourceBadge | Chaque interaction conforme aux critères US | Tous OK |
| **QG-NAV** | Liens et navigation internes | Visiter chaque route (§4 ARCHITECTURE), recharger chaque URL, tester bouton retour, fil d'Ariane, ids inconnus → 404 | Aucune page blanche, aucune erreur console | Tous OK |
| **QG-RESP** | Responsive | DevTools aux largeurs **320, 360, 390, 768, 1024, 1440 px** + 1 vrai téléphone si possible | Aucun défilement horizontal, contenu non coupé, carte ≤ 40 % de hauteur sur mobile, cibles ≥ 44 px | Tous OK ; captures jointes à la PR pour les stories UI |
| **QG-A11Y** | Accessibilité | (1) Parcours **clavier seul** complet ; (2) focus toujours visible ; (3) Lighthouse Accessibility sur les 4 pages ; (4) émulation `prefers-reduced-motion: reduce` ; (5) vérification « sans couleur » (DevTools → émulation achromatopsie) ; (6) zoom 200 % | (1)(2)(4)(5)(6) OK ; (3) score ≥ 95 | Tout écart bloquant corrigé ou tracé avec justification |
| **QG-SMOKE** | Parcours de démo sur l'URL publique | Navigation privée : `/` → Moon → fiche → récit (6 étapes) → source → Exit → Mars → fiche → About | Aucune erreur, < 3 min | Avant chaque fin de phase ≥ 2 et avant la démo |

## 4. Gates par phase

| Phase | Gate de sortie | Contrôles requis |
|---|---|---|
| 0 — Structuration | **Readiness review** | Documents relus et validés par l'équipe ; décisions OPEN bloquant la phase 1 tranchées (OPEN-01, 02, 04, 05, 11, 13, 17) ; cohérence PRD ↔ stories ↔ architecture |
| 1 — Fondations | Socle vert | G1–G5, QG-DATA (sur contenu initial), QG-NAV (routes squelettes), URL publique déployée |
| 2 — Destinations | Parcours étape 1 | G1–G5, QG-INT, QG-RESP, QG-A11Y (page `/`) |
| 3 — Exploration | Parcours étape 2 | G1–G5, QG-DATA, QG-INT (sync), QG-RESP, QG-A11Y (pages destination), QG-SCI (fiches publiées) |
| 4 — Récit | Parcours étape 3 | G1–G5, QG-DATA, QG-SCI (récits), QG-INT, QG-A11Y, QG-RESP |
| 5 — Finalisation | **Release** | Tous les contrôles, dont QG-LINKS, QG-LEGAL, QG-SMOKE, tests UX du CDC §10 |

## 5. Format du rapport de vérification (à coller dans le fichier de story et la PR)

```
## Vérification — US-x.y
| Contrôle | Commande / méthode | Résultat réel |
|---|---|---|
| G1 lint | npm run lint | ✅ 0 erreur (sortie : …) |
| G2 typecheck | npm run typecheck | ⛔ non exécutable (script absent) |
| G3 test | npm test | ✅ 42 passés / 0 échec |
| G4 build | npm run build | ✅ 145 Ko JS gzip |
| QG-A11Y | clavier + Lighthouse /explore/mars | ⚠️ 93 — contraste légende (tracé #12) |
Problèmes non résolus : …
```
