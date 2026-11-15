# US-5.12 — Faire revivre chaque machine

- **Statut** : review
- **Epic** : E5 — Transparence, qualité et publication
- **Priorité** : P0 (décision de l'équipe du 2026-11-14)
- **Exigences PRD** : EQUIP-002, MEDIA-001, ABOUT-001, NFR-A11Y-006
- **Décisions liées** : ADR-023 (nouvelle), ADR-022, ADR-020 ; règle de contenu V16 (DATA_MODEL)
- **Branche** : `feat/US-5.12-machine-lives` (partie de `feat/US-5.11-wow-experience`, non encore fusionnée) · **Cible** : `main` (touche `frontend/`, `backend/` et `docs/`)

## Story

En tant que visiteur, je souhaite choisir une machine comme on choisit une planète et écouter toute sa vie, de son arrivée à son dernier signal, afin de sentir que chaque appareil abandonné a une histoire à lui.

Demande de l'équipe (2026-11-14, résumé) : meilleure intro ; du son ; séparation stricte de chaque appareil ; mettre en avant leur durée de vie (mort prévue et réelle) ; immersion ; wolof ; narration audio ; plus de sources dans le contenu ; vidéos qui se lancent seules avec descriptions et enchaînent ; retirer la carte des sites ; choisir l'appareil comme la planète (survol, image, rotation 3D, sélection).

Choix de l'équipe (questions du 2026-11-14) : nouvelle intro faite d'images NASA ; voix du navigateur maintenant ; wolof pour l'interface, récits plus tard ; une page par machine.

## Critères d'acceptation

- [x] 1. Hangar : une carte par machine, surbrillance au survol/focus, rotation avant d'ouvrir — *preuve : test « lists every machine of the world as a card to wake up » ; captures Mars (hangar) et clic sur Opportunity.*
- [x] 2. Une page par machine, vie prévue/réelle sourcée en `draft` — *preuve : test « tells one machine its whole life » ; captures Opportunity (×57 : 90 sols prévus, 10 juin 2018 dernier signal) et réflecteur d'Apollo 11 (« fonctionne encore »).*
- [x] 3. Vidéos auto, son, narration — *preuve : test « plays its videos as a reel » ; vérification navigateur : la vidéo d'Ingenuity démarre seule (currentTime 4,9 s après défilement).*
- [x] 4. Wolof, carte et sources retirées, intro NASA — *preuves : test « asks the API in French … and in Wolof too » ; test intro mis à jour ; captures de l'intro (4 phrases synchronisées).*

## Faits ajoutés (backend/content, `status: "draft"`)

Recherche déléguée à un agent : chaque valeur citée depuis une page ouverte le 2026-11-14. Valeurs non vérifiées laissées hors du contenu (fin officielle de Pathfinder 1998, durée prévue de l'EASEP, distance de Sojourner, durée prévue de Surveyor 3).

**Conflits signalés, à trancher par un humain** :
- EASEP : fin le 27 août 1969 selon la NSSDCA, le 25 août selon NASA Science → valeur NSSDCA, l'autre date dans la note.
- Spirit : la note de statut existante dit « a terminé sa mission en 2010 » (`nasa-science-mer`), la page `mer-spirit` dit fin déclarée le 25 mai 2011 → `missionEnd` = 2011-05-25 ; **la note existante n'a pas été modifiée** (fait publié : validation humaine).

## Vérification

| Contrôle | Résultat réel |
|---|---|
| Frontend lint | 0 erreur ; avertissements : 2 préexistants + `VideoReel` media-has-caption (les vidéos NASA n'ont pas de piste de sous-titres ; leur description est écrite sur l'image) |
| Frontend typecheck | 0 erreur |
| Frontend tests | 67/67 sur 3 passages (−10 : 4 tests de carte retirés avec la carte ; tests de l'ancienne page Destination remplacés par 8 tests hangar/page machine) |
| Frontend build | OK ; JS initial 163 Ko gzip |
| Backend `npm run check` | 55/55 (3 tests V16 + 1 test API ajoutés) ; `content:check` 0 erreur |
| Navigateur | hangar Mars et Lune, clic → page Opportunity, Ingenuity (vidéos auto, 3D), réflecteur Apollo 11, wolof, intro ; 375 px sans débordement |
| Son / narration | Non entendus (pas de sortie audio pour l'agent) ; bouton de narration présent (synthèse vocale disponible) |

## À valider par un humain

- Chiffres de vie (`lifespan`, 11 machines) et les deux conflits ci-dessus.
- Traduction wolof (brouillon).
- Suppression éventuelle des fichiers devenus inutilisés : `SiteMap`, `MissionGallery`, `MissionTimeline`, `MachineJourney`, `MissionScene`, `MachineStage`, `WarpField`, `public/media/intro.mp4`, `intro-poster.jpg`, `space-bg.jpg`.
- Les dérogations de poids (textures, intro 6,2 Mo).
