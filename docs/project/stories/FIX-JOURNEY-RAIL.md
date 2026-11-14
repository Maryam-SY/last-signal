# Correctif — le rail de navigation ne recouvre plus le contenu (page destination)

- **Statut** : review
- **Origine** : défaut de US-5.6 (rail `JourneyRail`), signalé pendant le parcours scrollé ; correction demandée par l'équipe le 2026-11-14
- **Exigences** : NFR-A11Y-001 (contenu lisible), NFR-RESP-001
- **Branche** : `fix/journey-rail-label`, depuis `main` (`6969066`). Composant frontend : la règle OPEN-11 voudrait une PR vers `front`, mais `front` a 16 commits de retard sur `main` (ni US-5.6, ni le parcours). Il faut d'abord y refusionner `main`.

## Problème mesuré

Page `/explore/mars`, scène Spirit, Playwright (Chromium). Bords mesurés : rail, étiquette active, droite du contenu.

| Largeur | Avant |
|---|---|
| 800 et 1024 px | les **points** du rail recouvrent la droite du contenu (32 et 44 px) |
| 1280 → 1920 px | l'**étiquette active**, toujours affichée dès `xl`, recouvre le contenu (jusqu'à 350 px ; « MARS EXPLORATION ROVERS (SPIRIT AND OPPORTUNITY) ») |

## Correction

- **`DestinationPage`** : marge réservée au rail, `md:pr-16 lg:pr-20`, sur le conteneur du contenu. Le contenu reste centré dans l'espace restant.
- **`JourneyRail`** : l'étiquette de la section active n'est affichée en permanence qu'à partir de **1680 px**, la largeur à partir de laquelle 14 rem tiennent entre le contenu et le rail. Elle y est tronquée (`max-w-56 truncate`). Au survol et au focus clavier, l'étiquette s'affiche en entier à toutes les largeurs, comme avant.

## Vérification (Verify) — 2026-11-14

| Contrôle | Résultat réel |
|---|---|
| G1 lint · G2 typecheck · G3 test · G4 build (frontend) | lint 0 erreur (2 avertissements déjà présents), typecheck OK, 51 tests passés, build OK |
| Section active du rail | défilement réel à la molette jusqu'à Spirit (1440 px) : le rail désigne « Mars Exploration Rovers (Spirit and Opportunity) » ; détection inchangée |
| Mesure 800 / 1024 / 1280 / 1440 / 1680 / 1920 px | aucun chevauchement. Les points commencent 32 à 140 px après le contenu ; à 1680 et 1920 px, l'étiquette active commence après le bord du contenu (1384 > 1356 ; 1624 > 1476) |
| 360 px | pas de défilement horizontal ; rail masqué sous `md` comme avant |
| Captures | 1440 et 1680 px relues |
