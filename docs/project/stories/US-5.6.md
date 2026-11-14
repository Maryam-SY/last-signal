# US-5.6 — Immersion spatiale et scroll continu

- **Statut** : done
- **Epic** : E5 — Qualité et livraison
- **Priorité** : P0
- **Exigences PRD** : NAV-001, NAV-004, STORY-004 → 009, NFR-A11Y-001 → 008, MEDIA-001
- **Décisions liées** : ADR-018 (accueil), **ADR-019** (option A validée par l'équipe le 2026-11-14), ADR-015 (i18n)
- **Branche** : `feat/US-5.6-space-ux-polish`

## Story

En tant que visiteur de 10-15 ans, je souhaite que chaque page soit une expérience immersive où l'on avance en faisant défiler, sans navigation compliquée, afin d'avoir envie d'explorer et de toujours savoir où je suis.

## Arbitrage (2026-11-14)

Demande de l'équipe : « tout dans le scroll fixe, pas de navigations compliquées, juste de l'immersif ». Trois options présentées (A : scroll continu + HUD discret ; B : un seul scroll pour tout le site ; C : scroll seul sans boutons). **Option A retenue** (« Option A, vas-y ») → ADR-019. B cassait NAV-004, C cassait STORY-004/005.

## Critères d'acceptation

- [x] 1. Destination : planète épinglée, une scène par mission, scène « monde suivant », rail à partir de 768 px — *preuve : captures 1440 px et 360 px (Lune, Mars), test `api-pages` « shows the missions… » (lien `#mission-mission-a` dans le rail).*
- [x] 2. Récit : 6 scènes dans un même scroll ; `?step=` suit la scène visible ; rail, Previous/Next, Exit, ← → — *preuve : tests « moves between steps… », « changes step with the arrow keys… », « jumps to a step from the step list » ; navigateur : clic Suivant → `?step=2` + focus sur « Why », molette → `?step=3`, lien direct `?step=4` à 360 px.*
- [x] 3. En-tête : EN/FR mémorisé ; pas de débordement à 360 px — *preuve : test « switches the interface language from the header » ; `scrollWidth === innerWidth === 360` sur Destination et Récit.*
- [ ] 4. Sous `prefers-reduced-motion` : aucune animation, contenu complet — *chemins de code écrits (planète statique, `motion-reduce`, règle CSS globale) mais **non vérifié dans un navigateur** : l'émulation reduced-motion n'était pas disponible.*

## Réalisation

| Zone | Fichiers |
|---|---|
| Coquille | `app/Layout.tsx` (en-tête verre fixe, logo orbital, pied « console », `ScrollRestoration`), `navigation/LanguageSwitch.tsx`, `navigation/SiteNavigation.tsx`, `i18n/I18nProvider.tsx` (langue mémorisée) |
| Destination | `pages/DestinationPage.tsx`, `destination/DestinationPlanet.tsx`, `destination/NextWorld.tsx`, `gallery/MissionGallery.tsx` (scènes + frise orbitale), `gallery/MachineCard.tsx` (cartes verre), `navigation/JourneyRail.tsx`, `motion/ScrollProgress.tsx` |
| Récit | `pages/StoryPage.tsx`, `story/StepScene.tsx`, `story/StepRail.tsx`, `story/StoryControls.tsx`, `story/StoryEnd.tsx`, `story/storySteps.ts` |
| Partagé | `celestial/SpaceBackdrop.tsx`, `common/LoadState.tsx` (squelettes, « Signal perdu »), `hooks/useActiveSection.ts`, `lib/styles.ts`, `index.css` (accent de monde, `glass`, `skeleton`, `.dest-planet`, `@property --step-accent`) |
| Pages | `pages/AboutPage.tsx` (panneaux), `pages/NotFoundPage.tsx` (« Perdu dans l'espace », sonde SVG originale) |
| i18n | nouvelles clés dans `en.ts` **et** `fr.ts` (`lang`, `footer`, `destination.*`, `story.*`, `loading.signalLost`, `about.eyebrow`, `notFound.eyebrow`) |
| Tests | `api-pages.test.tsx` : 1 test adapté (les 6 étapes sont rendues, vérification limitée à la scène « Signal »), 2 ajoutés ; `routes.test.tsx` : 1 ajouté ; `test/setup.ts` : `window.scrollTo` neutralisé |

Aucune dépendance ajoutée. Aucune donnée scientifique dans le code : compteurs et textes viennent de l'API.

## Vérification (Verify) — 2026-11-14

| Contrôle | Commande / méthode | Résultat réel |
|---|---|---|
| G1 lint | `npm run lint` (frontend) | 0 erreur ; 2 avertissements **antérieurs** (`ui/button.tsx`, `MediaFigure.tsx`, fichiers non modifiés) |
| G2 typecheck | `npm run typecheck` | OK |
| G3 test | `npm test` | 4 fichiers, **34 tests passés** |
| G4 build | `npm run build` | OK (JS 447,8 kB / 139,0 kB gzip, CSS 76,3 kB) |
| Backend | — | non modifié, non relancé |
| Manuel 1440 px | navigateur intégré | Destination Lune/Mars, Récit Apollo 11 : OK |
| Manuel 360 px | navigateur intégré | Destination Mars, Récit Spirit/Opportunity `?step=4` : OK, pas de scroll horizontal |
| Reduced motion | — | **non exécuté** (pas d'émulation disponible) |
| Safari / Firefox | — | **non exécuté** |

## Journal de l'agent

- Problème trouvé et corrigé pendant la vérification : `ScrollRestoration` gardait la position d'une autre page pour les URL ouvertes depuis la barre d'adresse (clé `default`) → clé par URL dans ce cas.
- Fusion de `main` (PR #8, 2026-11-14) : conflits sur `MachineCard.tsx` (carte ouverte dans l'URL `?machine=`, Échap, relations) et `StoryPage.tsx` (sortie vers `paths.machine`, liens missions/machines de fin, « De → À » des relations). Logique de #8 conservée et portée dans `StoryEnd.tsx` / `StepScene.tsx` au nouveau style. Après fusion : frontend `npm run check` OK (39 tests), backend `npm run check` OK (44 tests). Pas de nouvelle vérification navigateur après fusion.
- Points ouverts : bloc média vide observé à l'étape *Discovery* d'Apollo 11 (image NASA lente ou URL à vérifier, relève de US-1.8) ; vérification reduced-motion et navigateurs autres que Chromium.

## Revue humaine

- Relu par : Birame · Date : 2026-11-14 · Verdict : **accepté** — PR #9 fusionnée (`83d6e2e`), CI verte. Critère 4 (`prefers-reduced-motion`) accepté sans vérification dans un navigateur : à contrôler avec US-5.3 (audit accessibilité).
