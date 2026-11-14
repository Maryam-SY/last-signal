# Lot « Storytelling » (frontend) — US-3.1, US-3.2, US-4.1 → US-4.4, US-4.7

- **Statut** : review
- **Epics** : E3, E4
- **Exigences PRD** : EXPL-001, EQUIP-001 → 005, SOURCE-002/003/005, STORY-001 → 009, MEDIA-001, NFR-READ-001, NFR-A11Y-*
- **Décisions** :
  - S'appuie sur la PR #2 (contenu et API de `main`) : ADR-016, ADR-017 (médias par URL), OPEN-08, OPEN-16 et OPEN-18 tranchées par l'équipe.
  - Nouvelle **ADR-019** (proposée) : types du frontend dérivés du backend.
- **Branche** : `claude/storytelling-missions-images-kapdgm`, imposée par l'environnement de l'agent au lieu de `feat/US-x.y-slug`. Créée depuis `main` (`625bf90`).
- **Rôles** : Dev, QA (Architect pour ADR-019 et les ajouts au contrat d'API).

## Historique

Une première version de ce lot avait son propre backend et son propre contenu. Entre-temps, la PR #2 a été fusionnée sur `main` avec une autre API, un autre contenu (4 récits, 183 médias) et la règle « médias par URL ». Sur décision de l'équipe, le lot a été **refait sur `main`** :
- le backend et le contenu de la PR #2 sont conservés ;
- seuls l'interface et trois ajouts additifs à l'API sont livrés.

La première version reste disponible localement (branche `backup/storytelling-v1`) et dans le bundle Git envoyé à l'équipe.

## Ce qui a été fait

### Ajouts additifs à l'API (aucun champ supprimé ni renommé)

- `GET /api/stories/:id` :
  - ajoute `missions[]` et `machines[]`, sous la forme `{ kind, id, name, destinationId }` ;
  - les relations portent `fromEntity` et `toEntity` (noms et destination des deux extrémités).
- `GET /api/machines/:id` :
  - les relations portent aussi `fromEntity` et `toEntity` ;
  - `sources` inclut les sources des relations affichées (avant, seules celles de l'équipement étaient résolues).
- Tests : 2 tests ajoutés dans `backend/src/routes/content.test.ts`.

### Frontend

- `src/types/content.ts` : types dérivés des réponses du backend (ADR-019). `src/lib/api.ts` envoie `?lang=` selon la langue de l'interface. `hooks/useApiResource.ts` gère chargement, 404, erreur avec « Try again » et annulation.
- Destination (`/explore/:id`) :
  - intro de la destination venant du contenu ;
  - par mission : période sourcée, résumé, sources, bouton **« Discover the story »** (récit principal, marqué « Draft » s'il n'est pas relu) et **« Key moments »** (frise datée chargée à l'ouverture, avec sources et médias) ;
  - cartes d'équipement : photo réelle en priorité, sinon une image avec son badge de nature.
- Fiche (`?machine=`) :
  - Dialog base-ui : piège de focus, Échap, retour du focus sur la carte ;
  - faits sourcés, relations « ce qui a été transmis », autres médias, lien vers le récit.
- Récit (`/stories/:id?step=1..6&from=`) :
  - progression, voix « Fact / What it means / Imagine », médias et sources par bloc, relations à l'étape Relay ;
  - bandeau « Draft », focus sur le titre à chaque étape, bouton retour du navigateur ;
  - fin de récit : retour à chaque mission du récit, machines citées, autre destination.
- Médias (ADR-017, CLAUDE.md §7) :
  - `DepictionBadge` visible pour tout média autre que `photo`/`document` (« Artist's view — not a photo », « Vue d'artiste — pas une photo »…) ;
  - crédit et lien vers la page source toujours affichés ;
  - les vidéos, modèles 3D et documents sont proposés sous forme de lien ;
  - une image distante qui ne charge pas est remplacée par un message.
- About : liste des sources (ancres `#source-…`), texte sur l'usage de l'IA et sur les crédits des médias.
- i18n : toutes les nouvelles chaînes existent en `en` et `fr`.

## Critères d'acceptation (preuves)

- **US-3.1**
  - [x] 1. Groupes titrés par mission.
  - [x] 2. Période non sourcée → rien affiché.
  - [x] 3. « Location not mapped » — `DestinationPage.test.tsx`.
  - [ ] 4. Test T2 : à faire par l'équipe.
- **US-3.2**
  - [x] 1. `?machine=` dans l'URL.
  - [x] 2. Statut en texte + icône, une source par fait.
  - [x] 3. Échap → fermeture et retour du focus.
  - [x] 4. Ouverture directe par l'URL.
  - [x] 5. Pas de récit → pas de bouton.
  - Tous couverts par `DestinationPage.test.tsx`.
- **US-4.1**
  - [x] 1. `?step=1` affiche l'étape Signal.
  - [x] 2. `step` invalide → étape 1.
  - [x] 3. Mouvement réduit : la transition est coupée (`motion-reduce:animate-none`).
- **US-4.2**
  - [x] 1. « Next » met l'URL à jour et place le focus sur le titre.
  - [x] 2. « Previous » est désactivé à l'étape 1 ; à l'étape 6, « Next » est remplacé par les choix de fin.
  - [x] 3. « Exit » ramène à la destination avec la machine d'origine sélectionnée.
  - [x] 4. Le bouton retour du navigateur revient à l'étape précédente.
- **US-4.3**
  - [x] 1. Étiquettes de voix affichées.
  - [x] 2. Un bloc `data` sans source est rejeté par la validation du backend (PR #2).
- **US-4.4**
  - [x] 1. Le panneau source s'ouvre sans changer d'étape.
  - [x] 2. Le lien s'ouvre dans un nouvel onglet, annoncé comme tel.
  - [ ] 3. Test T5 : à faire par l'équipe.
- **US-4.7**
  - [x] 1. Retour à la mission, machines associées, autre destination.
  - 2. Sans objet pour l'instant.

## Vérification (Verify) — sorties réelles du 2026-11-14

| Contrôle | Commande / méthode | Résultat réel |
|---|---|---|
| G1 lint | `npm run lint` (front, back) | front : 0 erreur, 1 avertissement préexistant (`components/ui/button.tsx`) · back : 0 |
| G2 typecheck | `npm run typecheck` | OK (front, back) |
| G3 test | `npm test` | front : 6 fichiers, 45 tests passés · back : 4 fichiers, 44 tests passés |
| G4 build | `npm run build` | OK (front : JS 490 kB, 156 kB gzip) |
| Contenu | `npm run content:check` | 0 erreur, 41 avertissements (préexistants : crédits absents de certaines pages source) |
| 360 / 1440 px | Playwright (Chromium), contenu réel, `reducedMotion: reduce` | Lune, Mars, frise MER, fiche Spirit, récits Ingenuity et Surveyor/Apollo 12 : aucun débordement horizontal |
| Lecteur d'écran, Lighthouse | — | **non exécutés** |

Remarque : dans l'environnement de l'agent, les images hébergées sur `assets.science.nasa.gov` et un CDN CloudFront sont bloquées par le réseau. Le repli « image indisponible » a été vu à cette occasion. Chez les visiteurs, ces images se chargent normalement (non vérifié depuis l'environnement).

## Points ouverts

1. ADR-019 à valider par l'équipe.
2. Les ajouts au contrat d'API sont additifs mais touchent le travail de la PR #2 : relecture par son auteur souhaitée.
3. Les 4 récits sont en `draft` : relecture QG-SCI via `docs/content/CONTENT_REVIEW.md`.
4. Médias en lien direct : si une page source change d'adresse, l'image disparaît. Le repli l'indique ; un futur `check:links` (US-1.5) devrait le détecter.
