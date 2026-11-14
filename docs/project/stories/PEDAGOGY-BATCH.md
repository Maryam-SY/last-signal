# Lot pédagogie : carte, photos, récit, frise, carnet, destination racontée, histoires d'images (US-3.3, US-3.4, US-5.7, US-5.8, US-5.9, US-5.10)

> Fichier de story groupé (demande de l'équipe du 2026-11-14 : « le site est trop simple et générique, améliore la pédagogie »). Rôles : UX + Dev + QA.
> Branche : `feat/US-3.3-pedagogy-map-photos` (une seule branche pour les 4 lots, comme `PHASE1-BATCH-1.md`). **Statut : review** (rien n'est commité).

## Demande et arbitrage

Quatre lots proposés, **les quatre validés** par l'équipe (2026-11-14) :

1. Carte des sites (US-3.3, US-3.4 : P0 déjà prévu, jamais construit).
2. Vraies photos partout (US-5.7) : petit champ calculé `cover` ajouté à l'API.
3. Récit plus pédagogique (US-5.7) : 3 voix expliquées, mots à connaître (glossaire), carnet « À toi », relais dessiné, statuts expliqués.
4. Frise Lune + Mars et carnet d'explorateur (US-5.8) : hors périmètre jusqu'ici → ajouté à SCOPE (P0, décision de l'équipe).

Mini-quiz : non fait (P2 dans SCOPE).

**Précisions de l'équipe en cours de travail (2026-11-14)** → US-5.9 :
- « En scrollant une planète, chaque mission doit afficher tout ce qu'on a — lancement, atterrissage, ce que la machine a fait, avec les photos — sans cliquer sur “photos, vidéos, sources” ni “mission step by step”. Les boutons à droite passent d'une mission à l'autre. »
- « Trop de photos sans raconter l'histoire derrière : il faut toujours raconter. » (rappel du défi NASA Space Apps 2026 « Abandoned but not Forgotten » : récit d'abord, montrer comment les missions ont fonctionné plutôt que lister des faits.)
→ Journal de mission toujours affiché, **une** image par moment raconté avec « Ce que tu vois : {texte alternatif} » ; galeries supprimées ; machines racontées en chapitres ; rail avec précédent / suivant sur tous les écrans.

## Critères

### US-3.3 — Carte (review)
- [x] Carte équirectangulaire SVG, marqueurs placés uniquement depuis les coordonnées sourcées ; aucun marqueur pour `coordinates: null`, ces machines sont listées sous la carte — tests `pedagogy.test.tsx` (« shows one named marker… », « lists the machines it cannot place… »).
- [x] Marqueurs `<button>` 44 × 44 px, nom « {nom}, {mission} » ; sites groupés à moins de 2° (« {lieu} : {n} machines ») avec liste des machines — test + navigateur (Océan des Tempêtes : 3 machines).
- [x] Sélection : plein + anneau + plus grand (pas la couleur seule) ; légende textuelle ; « Carte simplifiée — positions approximatives » et crédit du fond visibles.
- [x] 360 px : carte de 160 px de haut sur 740 (22 %), aucun défilement horizontal — mesuré dans le navigateur.
- [ ] Fond de carte : **grille schématique**, pas encore la mosaïque NASA/USGS prévue par OPEN-15 (téléchargement et vérification de licence à faire par la piste contenu).

### US-3.4 — Carte ↔ galerie (review)
- [x] Marqueur → `?machine=`, carte de galerie ouverte, mise en évidence, défilement et focus — test « selects the machine from its marker… » + navigateur (Surveyor 3).
- [x] Carte de galerie ouverte → marqueur sélectionné — test « lights up the marker… ».
- [x] Erreur de rendu de la carte : `ErrorBoundary` avec message, galerie intacte — **pas de test automatisé** de l'erreur.

### US-5.7 — Photos et récit pédagogique (review)
- [x] `cover` = première image `depiction: "photo"` (API) sur chaque carte et en ouverture du récit, avec crédit — tests backend + frontend.
- [x] Légende des 3 voix en tête de récit — test.
- [x] Mots à connaître par étape, définition + sources, mention « en cours de vérification » — test ; 10 entrées en `draft` dans `backend/content/glossary.json` (règle V14).
- [x] Carnet « À toi » : texte gardé dans `localStorage` uniquement, copier / effacer — test.
- [x] Relais dessiné « De → À » ; légende des statuts — tests.

### US-5.9 — Destination racontée au scroll (review)
- [x] Journal de mission affiché sans clic (date, titre, récit, une image légendée « Ce que tu vois », sources) — test « tells the mission step by step… », « illustrates each moment… » ; navigateur (Mars Pathfinder, « Bouncing onto Mars » + photo des airbags).
- [x] Machines en chapitres « Ce qu'elle a fait / Ce qu'elle est devenue / Ce qu'elle a transmis » + sources, une seule photo, aucune galerie — test « tells each machine as a short story… » ; navigateur 360 px (Sojourner : 1 image).
- [x] Rail : précédent / suivant + points sur tous les écrans ; pastille en bas à droite sous 768 px — navigateur 360 px.
- Tests remplacés (comportement supprimé à la demande de l'équipe) : bouton « Photos, videos and sources », Échap qui referme la fiche (US-3.2 critère 3, désormais sans objet), bouton « Show the mission step by step ».
- API : `GET /api/missions/:id` renvoie aussi `sources` (mission + étapes datées) — test backend.

### US-5.10 — L'histoire derrière chaque image (review)
- Demande : « Oui, rédige-les » (histoires des images du journal, en brouillon sourcé).
- [x] 36 histoires bilingues `draft` dans `backend/content/media.json`, chacune reprenant **seulement** la légende source du média ; 42 images sont affichées dans les journaux, 9 restent sans histoire (légende vide ou simple titre) — pas d'invention.
- [x] Règle V15 + tests backend (statut obligatoire ; tout reste en `draft`).
- [x] Affichage : l'histoire sous l'image, puis « Ce que tu vois : … » ; pour chaque moment, l'image racontable est préférée ; mention « brouillon » en fin de journal — test frontend « tells the story behind a picture… » ; navigateur (Lune : 15 histoires affichées).
- [ ] Relecture humaine des 36 textes ; illustration de `surveyor-3/digging` à revoir (photo de 1969 sur une étape de 1967) — CONTENT_REVIEW §5.10.

### US-5.8 — Frise et carnet d'explorateur (review)
- [x] `GET /api/timeline` : machines datées des deux mondes, triées — test backend ; frise Lune | Mars avec écart en années (« 35 years later ») — test frontend.
- [x] Carnet : mondes visités, récits terminés, machines examinées, 4 badges, remise à zéro ; navigateur uniquement — test.

## Règles scientifiques

- Aucune donnée inventée : la carte n'utilise que `coordinates` sourcées ; la frise que `date` sourcées ; les définitions du glossaire reprennent la formulation des récits et citent **les mêmes sources** que les blocs d'où elles viennent.
- Correction pendant la vérification : la carte disait « où une machine se trouve encore aujourd'hui » ; les rovers sont placés à leur **site d'atterrissage** (CONTENT_REVIEW §5.2) → texte changé en « où une machine s'est posée ou a été installée ».
- Les couvertures ne sont jamais des vues d'artiste ou des simulations (filtre `depiction: "photo"` côté API, et contrôle côté composant).

## Vérification (2026-11-14)

| Contrôle | Résultat réel |
|---|---|
| Frontend `npm run check` (après US-5.10 : **54 tests**) | lint 0 erreur (2 avertissements antérieurs : `ui/button.tsx`, `MediaFigure.tsx`) · typecheck OK · **53 tests** passés (6 fichiers) · build OK (JS 486,9 kB / 150,0 kB gzip) |
| Backend `npm run check` (après US-5.10) | OK · **51 tests** passés |
| `npm run content:check` | 0 erreur ; avertissements attendus : 4 récits et 10 entrées de glossaire en `draft` |
| Navigateur 1440 px | Carte Lune (2 sites, liste, sélection → carte Surveyor 3 avec photo), frise, récit Apollo 11 (relais dessiné, mots à connaître) : OK |
| Navigateur 360 px | Carte Mars, en-tête, missions, machine Sojourner (1 image), pastille ▲▼ : OK, pas de défilement horizontal |
| Navigateur 1440 px (US-5.9) | Mars Pathfinder : 5 moments racontés, une image chacun avec « What you see » |
| `prefers-reduced-motion`, Safari, Firefox | **non exécuté** |

Tests existants adaptés (intention conservée, portée restreinte) : « shows the missions… » (statut cherché dans la carte de la machine), « shows a clear error… » (erreur cherchée dans la section missions), « offers a way back… » (« Imagine » cherché dans l'étape « À toi »).

## Points ouverts

- Fond de carte NASA/USGS (OPEN-15) ; relecture scientifique du glossaire ; test automatisé de l'`ErrorBoundary` de la carte.

## Revue humaine

- Relu par : · Date : · Verdict : accepté | modifications demandées
