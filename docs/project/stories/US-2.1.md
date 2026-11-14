# US-2.1 — Choisir sa destination (accueil « depth journey »)

- **Statut** : review
- **Epic** : E2 — Choisir une destination
- **Priorité** : P0
- **Exigences PRD** : DEST-001, DEST-003, DEST-004, DEST-005, NFR-A11Y-001/005/006/007
- **Décisions liées** : ADR-007 (pas de lib), ADR-015 (i18n). Animations scroll/parallax avancées = P2 dans SCOPE : **réalisées sur demande écrite de l'équipe (session du 2026-11-14)**, à acter dans SCOPE.md par le PO.
- **Branche** : `feat/home-moon-mars` (créée depuis `main` à jour, `61f5fab`)

## Story

En tant que visiteur, je souhaite voir clairement les deux destinations et en choisir une afin de commencer mon exploration.

## Demande de l'équipe (à l'origine de la portée)

- Lune et Mars au centre de l'accueil ; effets au survol (rotations) ; distorsions au scroll ; clic sur une planète → entrée dans le détail.
- « Il ne faut pas sentir que l'on se déplace sur la page en scrollant, mais que la page vient vers nous » ; barre de défilement masquée.

## Critères d'acceptation

- [x] 1. 360 px : les deux destinations, leur nom et leur action visibles sans défilement horizontal — *preuve : capture 360×740, `scrollWidth === clientWidth === 360`.*
- [x] 2. Activer « Mars » (souris/toucher/clavier) mène à `/explore/mars` — *preuve : `routes.test.tsx` (clic), capture navigateur.*
- [x] 3. `prefers-reduced-motion: reduce` : aucune animation — *preuve : `ExplorePage.test.tsx` (rendu en sections classiques, pas de `depth-mode`) ; `useMotionLoop` inactif ; view transitions coupées en CSS.*
- [x] 4. Chaque destination est un lien nommé « Explore the Moon » / « Explore Mars » — *preuve : `ExplorePage.test.tsx`.*

## Réalisation

- `components/motion/DepthJourney.tsx` : piste de scroll + scène `sticky` en perspective ; le scroll déplace une caméra sur l'axe z (les calques viennent vers le visiteur, se floutent et disparaissent en passant). Scrollbar native masquée (`html.depth-mode`), remplacée par un indicateur de parcours (boutons ≥ 44 px). Snap de proximité sur chaque scène. Le focus clavier amène la caméra à la scène focalisée. Repli en sections classiques sous mouvement réduit.
- `components/celestial/WarpField.tsx` : champ d'étoiles canvas 2D qui fonce vers le visiteur ; la vitesse de scroll étire les étoiles en traînées.
- `components/celestial/LivePlanet.tsx` + extension de `Planet.tsx` (poignée impérative, filtre `feTurbulence`/`feDisplacementMap`) : rotation lente, accélération et inclinaison 3D vers le pointeur au survol/focus, reflet qui suit, ondulation liquide au survol et distorsion proportionnelle à la vitesse de scroll.
- `components/home/WorldPortal.tsx` : Lune et Mars au centre, chaque carte est un seul lien (DEST-003), anneaux d'orbite au survol/focus.
- `components/home/WorldChapter.tsx` : une scène par destination (planète tournant avec le scroll, nom géant en arrière-plan).
- `components/motion/ScatterText.tsx` : le titre éclate lettre par lettre quand la caméra le traverse ; skew selon la vitesse.
- Clic → `viewTransition` (react-router) : la planète cliquée se transforme en planète de la page destination (`home/worldTransition.ts`). Sans support navigateur : navigation normale.
- `Layout.tsx` : en-tête superposé (fixe, transparent) sur l'accueil uniquement.
- Accueil : les 10 autres corps (Mercure… comètes) ne sont plus affichés ; `celestialBodies.ts`, images et textes `bodies.*` conservés (About, futurs usages).
- Aucune nouvelle dépendance. Aucune donnée scientifique ajoutée (textes existants `bodies.*.description` ; la devise vient du CLAUDE.md).

## Vérification (Verify)

| Contrôle | Commande / méthode | Résultat réel |
|---|---|---|
| G1 lint | `npm run lint` | 0 erreur, 1 avertissement préexistant (`components/ui/button.tsx`) |
| G2 typecheck | `npm run typecheck` | OK |
| G3 test | `npm test` | 3 fichiers, 19 tests passés |
| G4 build | `npm run build` | OK (JS 386 kB / 122 kB gzip) |
| 360 px / 1440 px | navigateur intégré | Accueil sans débordement horizontal ; 4 scènes vérifiées par capture |
| Mouvement réduit | test automatisé | OK ; non vérifié manuellement dans un navigateur |

## Points ouverts

- Animations : dépassent la règle DESIGN_SYSTEM « ≤ 200 ms, opacity/transform » et le classement P2 de SCOPE → à valider/acter par le PO.
- La décroissance de l'ondulation d'arrivée et la fluidité réelle n'ont pas pu être observées (panneau navigateur masqué, `requestAnimationFrame` suspendu) : à vérifier sur un vrai navigateur, y compris Safari et Firefox.
- Performance sur mobile bas de gamme (filtres SVG + canvas) non mesurée.
