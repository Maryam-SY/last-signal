# Compléments au frontend connecté — US-3.2, US-4.2, US-4.7

- **Statut** : review
- **Epics** : E3, E4
- **Exigences PRD** : EQUIP-002/003, NAV-003, STORY-005/006/008, SOURCE-005, MEDIA-001
- **Décisions liées** : ADR-016, ADR-017 (médias par URL). Aucune décision nouvelle.
- **Branche** : `claude/storytelling-missions-images-kapdgm` (branche imposée par l'environnement de l'agent)
- **Rôles** : Dev, QA

## Contexte

Cette branche a d'abord livré son propre backend, puis son propre frontend. Les PR #2 (`feat/content-api`) et #5 (`feat/frontend-api`) ont livré le même périmètre sur `main` pendant ce temps. Sur décision de l'équipe, la branche **reprend `main` tel quel** (commit de fusion qui garde la version de `main` pour chaque fichier). Elle n'ajoute que les manques listés dans `FRONTEND-API.md`. Le diff de la PR se limite donc à ce delta.

## Ce qui est ajouté

| Story | Ajout |
|---|---|
| US-3.2 (EQUIP-003) | La fiche dépliable d'une machine est **pilotée par l'URL** : `?machine=<id>` l'ouvre (lien partageable, rechargement), l'ouvrir ou la fermer remplace l'entrée d'historique. **Échap** la ferme quand le focus est dans la carte et rend le focus au bouton. Une seule fiche est ouverte à la fois. La fiche affiche aussi **ce qui a été transmis** (relations avec leur preuve). |
| US-4.2 (critère 3) | « Exit story » et « Back to the machines of … » ramènent à la machine d'origine **avec sa fiche ouverte** (`paths.machine()` → `?machine=…#machine-…`). |
| US-4.7 (critère 1) | La fin du récit propose aussi **les missions du récit** (`#mission-…`) et **les machines du récit** (fiche ouverte). |
| SOURCE-005 | Les relations affichent leurs **deux extrémités nommées** (« Surveyor 3 → Apollo 12 »), dans le récit et dans la fiche (`RelationEnds`). |
| ADR-017 | Une image distante qui ne charge pas est remplacée par un message. La légende garde le lien vers la page NASA. |

API, ajouts **additifs** uniquement (`backend/src/content/repository.ts`, ARCHITECTURE §16) :
- `GET /api/stories/:id` : `machines[]` et relations avec `fromEntity`/`toEntity` ;
- `GET /api/machines/:id` : relations avec `fromEntity`/`toEntity` ; `sources` inclut celles des relations.

Test existant modifié : dans `api-pages.test.tsx`, le lien de fin de récit attend désormais `/explore/mars?machine=machine-a#machine-machine-a` au lieu de `#machine-machine-a` (US-4.2 critère 3). Aucun test supprimé.

## Vérification (Verify) — sorties réelles du 2026-11-14

| Contrôle | Commande / méthode | Résultat réel |
|---|---|---|
| G1 lint | `npm run lint` | front : 0 erreur, 2 avertissements **déjà présents sur `main`** (`button.tsx`, `<video>` sans piste de sous-titres dans `MediaFigure.tsx`) · back : 0 |
| G2 typecheck | `npm run typecheck` | OK (front, back) |
| G3 test | `npm test` | front : 4 fichiers, 36 tests passés (31 sur `main` + 5) · back : 4 fichiers, 44 tests passés (42 + 2) |
| G4 build | `npm run build` | OK (front, back) |
| Navigateur | Playwright, vrai backend, `reducedMotion: reduce` | `/explore/moon?machine=surveyor-3-lander` : fiche ouverte et page positionnée sur la carte (360 px) ; récit Surveyor/Apollo 12, étape 5 (360 px) ; fin du récit Spirit & Opportunity (1440 px) : missions et 4 machines proposées ; aucun défilement horizontal |
| Lecteur d'écran | — | **non exécuté** |

Remarque : le réseau de l'environnement de l'agent bloque certains hôtes d'images NASA. Le message de repli a donc été vu en conditions réelles, mais l'affichage de ces images n'a pas pu être vérifié depuis cet environnement.
