# US-2.4 — Vidéo d'introduction et accueil qui s'allume

- **Statut** : review
- **Epic** : E2 — Choisir sa destination
- **Priorité** : P0 (décision de l'équipe du 2026-11-14)
- **Exigences PRD** : DEST-001, NFR-A11Y-002, NFR-A11Y-006
- **Décisions liées** : ADR-018 (accueil depth journey), **ADR-021** (vidéo d'intro, ciel commun)
- **Branche** : `feat/US-2.4-intro-video`

## Demande

« Prends la vidéo et utilise-la comme page d'accueil : elle tourne au début, et à la fin c'est notre page d'accueil, avec les deux planètes, une animation qui écrit en haut « choisis ta destination », les deux planètes en surbrillance avec le fond. Le fond de la vidéo devient le fond de tout le site. »

## Critères d'acceptation

- [x] 1. Vidéo plein écran, muette, une fois par visite ; « Passer l'intro » (focalisé) et Échap ; ignorée sous reduced motion ou si la lecture est refusée — tests `intro.test.tsx` ; navigateur 1440 px et 360 px.
- [x] 2. Fondu croisé vers l'accueil, Lune et Mars en halo, titre tapé lettre par lettre (texte complet toujours lisible par les lecteurs d'écran) — test « types the title letter by letter… » ; navigateur.
- [x] 3. Ciel de la vidéo, planètes retirées, derrière toutes les pages — navigateur (accueil, Lune, About).

## Réalisation

- Fichiers : `frontend/public/media/intro.mp4` (H.264 sans audio, 0,69 Mo), `intro-poster.jpg` (22 Ko), `space-bg.jpg` (161 Ko). Le ciel vient de la dernière image de la vidéo : le ciel sans étoiles est diffusé dans les disques des planètes, puis le grain d'étoiles des bandes haute et basse de l'image y est réemployé.
- Code : `components/home/IntroVideo.tsx`, `components/home/introSession.ts`, `pages/ExplorePage.tsx` (états `playing → fading → done`, titre tapé, halos), `components/motion/ScatterText.tsx` (option `typed`), `components/celestial/{WarpField,SpaceBackdrop,Starfield}.tsx`, `index.css` (`.space-sky`, `.typing-caret`, `.planet-glow`), i18n `intro.*` (en, fr).
- Tests : `src/pages/intro.test.tsx` ; `test/setup.ts` simule un navigateur qui refuse la lecture automatique (comportement par défaut des autres tests).

## Vérification (2026-11-14)

| Contrôle | Résultat réel |
|---|---|
| Frontend `npm run check` | voir la sortie consignée dans la PR |
| Navigateur 1440 px | vidéo en lecture (t = 3,1 s), fondu, accueil avec titre tapé et planètes en halo ; ciel visible sur Lune et About |
| Navigateur 360 px | vidéo entière en portrait, bouton « Skip intro », accueil sans défilement horizontal |
| Safari / Firefox, lecteur d'écran réel | **non exécuté** |

## Points ouverts

- **Origine et licence de la vidéo** (et de sa musique, non utilisée) à confirmer, puis crédit dans About (ABOUT-001).

## Revue humaine

- Relu par : · Date : · Verdict : accepté | modifications demandées
