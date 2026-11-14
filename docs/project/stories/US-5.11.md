# US-5.11 — Effet « waouh » : visuels HD, fluidité, pédagogie

- **Statut** : review
- **Epic** : E5 — Transparence, qualité et publication
- **Priorité** : P0 (décision de l'équipe du 2026-11-14)
- **Exigences PRD** : MEDIA-001, ABOUT-001, NFR-PERF-001/002, NFR-A11Y-006
- **Décisions liées** : ADR-022 (nouvelle), ADR-020 (three déjà présent), ADR-021 (ciel de la vidéo, remplacé)
- **Branche** : `feat/US-5.11-wow-experience` · **Base et cible de la PR** : `main` (touche `frontend/` et `docs/`)

## Story

En tant que visiteur (et jury du hackathon), je souhaite un site au rendu réaliste, fluide et qui explique clairement le parcours, afin d'avoir envie de découvrir le spatial.

Demande de l'équipe (2026-11-14, résumé) : images de fond de plus haute qualité et plus réalistes ; meilleures animations et effets ; corriger le lag ; meilleure pédagogie ; ne plus mettre la source sous chaque photo (les regrouper sur « À propos »).

## Critères d'acceptation

- [x] 1. Globes 3D éclairés, textures NASA HD, ciel NASA HD, repli photo sans WebGL, image fixe sous reduced motion — *preuve : captures du navigateur intégré (Lune, Mars, accueil) ; tests jsdom (sans WebGL) verts avec le repli SVG.*
- [x] 2. 60 images/s au scroll (Destination, accueil) — *preuve : mesures ci-dessous.*
- [x] 3. Plus de crédit sous les images ; crédits groupés sur About ; badges de nature conservés ; sources repliées — *preuve : test « lists every picture credit once, on the About page », test « without a credit line under it », test MEDIA-001 inchangé et vert.*
- [x] 4. Accueil : parcours en 3 étapes + chiffres depuis l'API — *preuve : tests « explains the visit in three stages », « shows the numbers of the site from the API ».*

## Plan (réalisé)

| Axe | Changement | Fichiers |
|---|---|---|
| Perf | Étoiles peintes une fois, déplacées en `translate3d` | `components/celestial/Starfield.tsx` |
| Perf | `glass` sans `backdrop-filter` ; `glass-blur` pour les petites barres fixes | `index.css`, `Layout.tsx`, `StoryControls.tsx`, `IntroVideo.tsx` |
| Perf | Plus de `backdrop-blur` sur la scène machine ; fond flouté de la scène statique | `MachineJourney.tsx`, `MachineStage.tsx` |
| Visuel | Globes WebGL (three chargé à la demande), photo SVG en attendant / en repli | `celestial/globe/createGlobe.ts`, `LivePlanet.tsx`, `content/celestialBodies.ts`, `types/three.d.ts` |
| Visuel | Textures Lune/Mars 2k + 4k, ciel Voie lactée 1280/1920 | `public/planets/globe/*`, `public/media/sky-milkyway-*.webp` |
| Effets | Ciel qui dérive, étoiles qui scintillent, titre balayé de lumière, chiffres qui comptent, CTA qui « respire », héros Destination qui monte | `index.css`, `motion/CountUp.tsx`, `ExplorePage.tsx`, `DestinationPage.tsx` |
| Pédagogie | Scène « Ton expédition » (3 étapes + « Commencer par la Lune »), chiffres du site, intro réécrite | `ExplorePage.tsx`, `i18n/messages/{en,fr}.ts` |
| Crédits | Lignes de crédit retirées (MediaFigure, MachineStage, MissionScene, CoverPhoto, ModelViewer3D) ; page About : visuels du site + toutes les images groupées par auteur, avec licence et lien | `sources/MediaCredits.tsx`, `AboutPage.tsx`, `api/client.ts` (`/api/media`) |
| Sources | Sources de mission et de machine repliées (« Sources (n) ») | `sources/SourcesDisclosure.tsx`, `MissionTimeline.tsx`, `MachineCard.tsx` |

Aucune dépendance ajoutée. Aucune donnée scientifique ajoutée dans le code (les chiffres de l'accueil viennent de l'API).

## Origine des visuels (tous domaine public)

| Fichier | Source | Traitement |
|---|---|---|
| `planets/globe/moon-{2k,4k}.webp` | NASA SVS 4720 « CGI Moon Kit », `lroc_color_poles_4k.tif` | redimensionné, contraste +8 %, WebP |
| `planets/globe/moon-relief.webp` | NASA SVS 4720, `ldem_3_8bit.jpg` (LOLA) | gris, WebP |
| `planets/globe/mars-{2k,4k}.webp` | USGS Astrogeology, Viking MDIM 2.1 colorisée 1 km (NASA/JPL/USGS) | redimensionné, saturation +18 %, contraste +6 %, WebP |
| `media/sky-milkyway-{1280,1920}.webp` | NASA SVS 4851 « Deep Star Maps 2020 », `starmap_2020_8k_gal.exr` | recadrage autour du centre galactique, exposition ×9, rotation −16°, WebP |

## Vérification (Verify)

| Contrôle | Commande / méthode | Résultat réel |
|---|---|---|
| G1 lint | `npm run lint` (frontend) | 0 erreur, 2 avertissements **déjà présents sur `main`** (`button.tsx` only-export-components, `MediaFigure.tsx` media-has-caption) |
| G2 typecheck | `npm run typecheck` | 0 erreur |
| G3 test | `npm test` | 76/76 verts sur 5 passages consécutifs. Instabilité préexistante constatée : sur `main` non modifié, 1 passage sur 6 a eu 2 échecs aléatoires (délais `findBy` sous charge) ; même phénomène vu 1 fois sur ma branche avant 5 passages verts |
| G4 build | `npm run build` | OK ; JS initial 158 Ko gzip ; `three` dans un morceau séparé chargé à la demande (148 Ko gzip, partagé avec model-viewer) |
| Fluidité | Navigateur intégré 987 × 630, DPR 1,25 ; 90 `scrollTo` espacés de 33 ms, intervalles `requestAnimationFrame` | Mars **avant** : 16 images en ~3 s, médiane 350 ms. **Après** : Mars médiane 16,7 ms / p95 17,2 ms / 0 > 34 ms ; Lune idem (p95 17,2 ms) ; accueil médiane 16,7 ms / p95 33,3 ms / 0 > 34 ms (avant : p95 33,5 ms) |
| 360 px | Navigateur intégré 360 × 740 | Accueil et Mars : `scrollWidth` = 360 (aucun débordement) ; scène « Ton expédition » tient dans l'écran |
| Reduced motion | Non vérifié dans le navigateur | Logique : `useMotionLoop` coupé → globe dessiné une fois ; animations CSS sous `prefers-reduced-motion: no-preference` uniquement |

## 2e passe (2026-11-14) — fond animé, planètes, vol de photos

Demande de l'équipe : « l'arrière-plan doit s'animer, avancer » ; « bien centrer les planètes, les ombres » ; « utiliser l'animation de konkelectrical.com quand on entre dans une mission ou un robot ; laisser la première page comme ça ».

- [x] 5. Fond animé qui avance — *preuve : `SpaceScene` (ADR-022, complément) ; différence de pixels mesurée entre deux images à 1 s d'écart ; captures accueil et Mars.*
- [x] 6. Vol de photos dans les missions et les machines, accueil inchangé — *preuve : test « flies through the pictures of the mission log, keeping them readable » ; captures 1366 × 768 et 375 × 740 ; aucun débordement horizontal (`scrollWidth` = `clientWidth`).*

| Fichier | Changement |
|---|---|
| `celestial/SpaceScene.tsx`, `celestial/space/createSpaceScene.ts` | Ciel WebGL vivant, monté dans `app/Layout.tsx` |
| `celestial/SpaceBackdrop.tsx`, `pages/ExplorePage.tsx` | Ne dessinent plus le ciel (lueur d'ambiance seule ; `WarpField` retiré de l'accueil) |
| `celestial/globe/createGlobe.ts`, `LivePlanet.tsx`, `index.css` | Soleil frontal, liseré nocturne, flottement |
| `journey/PhotoFlight.tsx`, `index.css` | Vol de photos (canvas réduits hors fil principal, file d'attente) |
| `gallery/MissionTimeline.tsx`, `journey/MachineJourney.tsx`, `gallery/MachineCard.tsx` | Journal et chapitres en vol de photos ; la photo de la machine est dans sa carte |
| `media/MediaFigure.tsx` (`captionOnly`), `media/CoverPhoto.tsx` (badge si pas une photo, miniature NASA d'abord) | |
| `pages/api-pages.test.tsx` | 2 tests adaptés (photo dans la carte), 1 test ajouté |

| Contrôle | Résultat réel |
|---|---|
| G1 lint | 0 erreur, 2 avertissements préexistants |
| G2 typecheck | 0 erreur |
| G3 test | 77/77 sur 3 passages consécutifs |
| G4 build | OK ; JS initial 159 Ko gzip ; `createSpaceScene` 2,1 Ko gzip, chargé à la demande |
| Fluidité Mars | 1er passage : médiane 16,7 ms, p95 17,3 ms, pire 216 ms (préparation des photos) ; 2e passage : pire 17,4 ms |

**À valider par un humain** : `WarpField.tsx` et `journey/MachineStage.tsx` ne sont plus utilisés (non supprimés, CLAUDE.md §6) ; textes du panneau de lecture longs sur téléphone (la photo reste visible au-dessus) ; dérogation NFR-PERF-001 inchangée.

## Journal de l'agent

- Modèle / session : Claude (Claude Code), 2026-11-14.
- Piège trouvé et corrigé : sur l'accueil, `getBoundingClientRect()` d'un canvas placé dans la scène 3D est agrandi par la perspective → tampons WebGL de 6657 × 5108 px pour un globe de 252 px (15 images/s). Corrigé par `clientWidth` + plafond.
- Décisions prises en cours de route : sources repliées plutôt que supprimées (SOURCE-002 reste satisfaite, demande « pas de source sous chaque photo » respectée) ; `space-bg.jpg` conservé mais plus utilisé (pas de suppression sans validation).
- **À valider par un humain** : dérogation NFR-PERF-001 pour les textures (> 300 Ko) ; textes pédagogiques de l'accueil (EN/FR) ; le crédit « AI » de la page About reste « à compléter » (non inventé).
