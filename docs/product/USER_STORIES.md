# User Stories — AeroReborn

> Rôles BMAD : Product Owner / Scrum Master · Version 1.0 (Phase 0) · Statut : **en attente de validation**
> Chaque story trace ses exigences ([PRD.md](PRD.md)) et suit le cycle de vie ci-dessous. Quand une story passe en développement, un fichier `docs/project/stories/US-x.y.md` est créé depuis [le modèle](../project/stories/_TEMPLATE.md).

## Cycle de vie

| Statut | Signification | Qui change le statut |
|---|---|---|
| `backlog` | Rédigée, pas encore prête | PO |
| `blocked` | Dépend d'une décision `OPEN-xx` non tranchée | PO |
| `ready` | Definition of Ready satisfaite ([QUALITY_GATES §1](../quality/QUALITY_GATES.md#1-definition-of-ready-dor)) | PO / humain |
| `in-progress` | En cours, fichier de story créé | Agent dev |
| `review` | Implémentée, gates exécutés, en attente de relecture humaine | Agent dev |
| `done` | Relue et fusionnée sur `main` | **Humain uniquement** |

Format : *En tant que [utilisateur], je souhaite [action] afin de [bénéfice].* Critères au format **Étant donné / Quand / Alors**.

Personas : **Visiteur** (10-15 ans, principal), **Curieux** (adulte), **Équipe** (développeurs), **Rédacteur** (contenu scientifique).

---

## Epic E1 — Fondations techniques (Phase 1)

### US-1.1 — Identité projet unifiée
- **Story** : En tant qu'équipe, je souhaite un nom de produit unique et des documents de référence versionnés afin que personne (humain ou agent) ne travaille sur une version obsolète.
- **Priorité** : P0 · **Exigences** : ABOUT-002 · **Statut** : `in-progress` (OPEN-01 tranchée ; reste le critère 3 : PDF dans `docs/reference/`)
- **Critères** :
  1. Étant donné le dépôt, quand on ouvre `frontend/index.html`, alors `<title>` vaut « AeroReborn ».
  2. Étant donné la racine, alors un `README.md` décrit le projet, les commandes et renvoie vers `docs/`.
  3. Étant donné `docs/reference/`, alors les deux PDF de référence y sont présents.

### US-1.2 — Ligne de base et migration TypeScript
- **Story** : En tant qu'équipe, je souhaite un projet TypeScript strict qui compile, se teste et se build afin de détecter les erreurs de données et de props avant l'exécution.
- **Priorité** : P0 · **Exigences** : NFR-MAINT-001, DEPLOY-002 · **Statut** : `review` (étendue au backend, ADR-016)
- **Critères** :
  1. Étant donné une installation propre (`npm ci`), quand on lance `lint`, `test`, `build` **avant migration**, alors les résultats sont consignés (ligne de base).
  2. Étant donné la migration, alors tous les fichiers `src/` sont en `.ts`/`.tsx`, `tsconfig.json` a `strict: true`, et `npm run typecheck` (`tsc --noEmit`) passe.
  3. Étant donné `components.json`, alors `tsx: true`.
  4. `cn()` n'a plus qu'une seule implémentation.

### US-1.3 — Structure, routeur et coquille d'application
- **Story** : En tant qu'équipe, je souhaite la structure de dossiers cible et des routes vides afin que chaque story s'insère sans réorganisation.
- **Priorité** : P0 · **Exigences** : NAV-001, NAV-004 · **Statut** : `review`
- **Critères** :
  1. Étant donné les routes `/`, `/explore/:destinationId`, `/stories/:storyId`, `/about`, quand on les visite, alors une page squelette avec un `<h1>` s'affiche.
  2. Étant donné un chemin inconnu ou `/explore/pluto`, alors la page 404 s'affiche avec un lien vers l'accueil.
  3. Étant donné toute page, alors l'en-tête affiche « Explore » et « About & Sources ».
  4. La structure correspond à [ARCHITECTURE.md §3](../architecture/ARCHITECTURE.md#3-organisation-des-dossiers).

### US-1.4 — Design tokens COSMOS
- **Story** : En tant qu'équipe, je souhaite des tokens de couleur, typographie et focus conformes à l'identité COSMOS afin d'obtenir une interface cohérente et accessible par défaut.
- **Priorité** : P0 · **Exigences** : NFR-A11Y-002, NFR-A11Y-003 · **Statut** : `review`
- **Critères** :
  1. Les variables CSS de [DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md) sont définies et exposées à Tailwind.
  2. Space Grotesk, Inter et IBM Plex Mono sont chargées localement (pas de requête à un CDN de polices).
  3. Le style de focus par défaut respecte NFR-A11Y-002.

### US-1.5 — Modèle de contenu et contrôle d'intégrité
- **Story** : En tant qu'équipe, je souhaite des types et un test d'intégrité du contenu afin qu'aucune donnée non sourcée ou incohérente n'atteigne l'interface.
- **Priorité** : P0 · **Exigences** : DATA-001 → 006, SOURCE-001, SOURCE-003, MAP-003 · **Statut** : `review` côté backend (types, validation, API, tests) et accès frontend (client typé, ADR-019) ; `check:links` reste à faire
- **Critères** :
  1. Étant donné `frontend/content/`, alors les fichiers de [DATA_MODEL.md](../architecture/DATA_MODEL.md) existent (éventuellement vides).
  2. Quand un fait référence une source inexistante, alors `npm test` échoue avec un message citant l'identifiant fautif.
  3. Quand un récit n'a pas exactement les 6 étapes dans l'ordre, alors `npm test` échoue.
  4. Quand une coordonnée sort de [-90, 90] / [-180, 180], alors `npm test` échoue.
  5. Les accesseurs typés (`getDestination`, `getMissionsByDestination`…) sont couverts par des tests.

### US-1.6 — Intégration continue
- **Story** : En tant qu'équipe, je souhaite que chaque PR soit contrôlée automatiquement afin de ne jamais casser `main`.
- **Priorité** : P0 · **Exigences** : DEPLOY-002 · **Statut** : `review` (workflow écrit, pas encore exécuté sur GitHub)
- **Critères** : étant donné une PR, quand elle est ouverte, alors GitHub Actions exécute `lint`, `typecheck`, `test`, `build` dans `frontend/` et affiche le statut sur la PR.

### US-1.7 — Déploiement du squelette
- **Story** : En tant qu'équipe, je souhaite une URL publique dès la phase 1 afin de découvrir les problèmes d'hébergement tôt.
- **Priorité** : P0 · **Exigences** : DEPLOY-001, NAV-004 · **Statut** : `blocked` (OPEN-05, OPEN-18 : il faut maintenant héberger aussi l'API)
- **Critères** :
  1. Étant donné un push sur `main`, alors le site est déployé automatiquement.
  2. Quand on recharge `/explore/moon` sur l'URL publique en navigation privée, alors la page s'affiche (fallback SPA).

### US-1.8 — Catalogue scientifique Lune/Mars (piste contenu)
- **Story** : En tant que rédacteur, je souhaite établir la liste sourcée des missions et équipements Lune/Mars afin que l'interface affiche uniquement des faits vérifiés.
- **Priorité** : P0 · **Exigences** : DATA-002, DATA-004, DATA-005, SOURCE-001, SOURCE-003 · **Statut** : `in-progress` — lot 1 (6 missions, 11 équipements, 17 sources, 56 médias) dans `backend/content/`, relecture humaine à faire (`docs/content/CONTENT_REVIEW.md`)
- **Critères** :
  1. Chaque mission et équipement retenu a un identifiant, une destination et ≥ 1 source NASA/NSSDCA avec date de consultation.
  2. Les champs non vérifiés valent `null`.
  3. La liste est relue par une seconde personne (QG-SCI) puis validée par l'équipe → clôture OPEN-07.
  4. Les sources héritées du CDC v2 sont revérifiées une par une (cas Apollo 11 LM).

---

## Epic E2 — Choisir une destination (Phase 2)

### US-2.1 — Choisir sa destination
- **Story** : En tant que visiteur, je souhaite voir clairement les deux destinations et en choisir une afin de commencer mon exploration.
- **Priorité** : P0 · **Exigences** : DEST-001, DEST-003, DEST-004, DEST-005, NFR-A11Y-001/005/006/007 · **Statut** : `review` (fusionnée sur `main` via PR #3 ; accueil « depth journey », ADR-018 ; passage en `done` par un humain)
- **Critères** :
  1. Étant donné l'accueil sur un téléphone de 360 px, alors les deux destinations, leur nom et leur action sont visibles sans défilement horizontal.
  2. Quand j'active la carte « Mars » à la souris, au toucher ou au clavier, alors j'arrive sur `/explore/mars`.
  3. Étant donné `prefers-reduced-motion: reduce`, quand je choisis une destination, alors aucune animation n'est jouée.
  4. Étant donné un lecteur d'écran, alors chaque destination est annoncée comme un lien nommé « Explore the Moon » / « Explore Mars ».

### US-2.2 — Aperçu des destinations
- **Story** : En tant que visiteur, je souhaite une image et quelques informations sur chaque destination afin de savoir ce que je vais y trouver.
- **Priorité** : P0 · **Exigences** : DEST-002, ABOUT-001 (crédit image)
- **Critères** :
  1. Chaque image a un texte alternatif et un crédit consultable dans About.
  2. Étant donné `showCounts: true`, alors les nombres affichés sont calculés depuis le contenu ; étant donné `false`, alors aucun nombre n'apparaît.

### US-2.3 — Me repérer partout
- **Story** : En tant que visiteur, je souhaite savoir où je suis et revenir en arrière facilement afin de ne jamais me perdre.
- **Priorité** : P0 · **Exigences** : NAV-001, NAV-002, NAV-003, NAV-005
- **Critères** :
  1. Étant donné une fiche ouverte sur Mars, alors le fil d'Ariane affiche `Explore › Mars › {Mission} › {Équipement}` avec liens actifs.
  2. Quand j'active « Back to destinations », alors j'arrive sur `/` avec le focus sur le `<h1>`.

---

## Epic E3 — Explorer les équipements (Phase 3)

> Ordre imposé : **galerie avant carte** (la galerie est le plan de secours exigé par le CDC §9).

### US-3.1 — Parcourir les équipements par mission
- **Story** : En tant que visiteur, je souhaite voir les équipements regroupés par mission afin de comprendre quelle mission les a apportés.
- **Priorité** : P0 · **Exigences** : EXPL-001, EQUIP-001, EQUIP-004, SYNC-003 · **Dépend de** : US-1.5, US-1.8 · **Statut** : `review` (critère 4, test T2, à faire par l'équipe ; voir `docs/project/stories/STORYTELLING-BATCH.md`)
- **Critères** :
  1. Étant donné `/explore/mars`, alors chaque mission de Mars présente dans le contenu apparaît comme un groupe titré, avec ses équipements.
  2. Étant donné une période non sourcée, alors aucune date n'est affichée pour ce groupe.
  3. Étant donné un équipement sans coordonnées, alors sa carte affiche « Location not mapped ».
  4. Test T2 du CDC réussi sans utiliser la carte.

### US-3.2 — Consulter un équipement
- **Story** : En tant que visiteur, je souhaite ouvrir la fiche d'un équipement afin de connaître sa mission, son lieu, son statut et ce qu'il a permis d'apprendre.
- **Priorité** : P0 · **Exigences** : EQUIP-002, EQUIP-003, EQUIP-005, SOURCE-002, STORY-003 · **Statut** : `review`
- **Critères** :
  1. Quand j'active une carte d'équipement, alors l'URL contient `?machine={id}` et la fiche détaillée s'ouvre.
  2. Étant donné la fiche, alors le statut est affiché en texte + icône, et chaque fait a un accès à sa source.
  3. Quand j'appuie sur `Échap` ou « Close », alors la fiche se ferme et le focus revient sur la carte d'origine.
  4. Étant donné l'URL `?machine={id}` chargée directement, alors la fiche s'ouvre au chargement.
  5. Étant donné un équipement sans récit ni récit de mission, alors aucun bouton « Discover its story » n'est affiché.

### US-3.3 — Situer les équipements sur une carte
- **Story** : En tant que visiteur, je souhaite voir où se trouvent les équipements sur une carte simplifiée afin de me représenter leur emplacement.
- **Priorité** : P0 · **Exigences** : MAP-001 → 006 · **Statut** : `blocked` (OPEN-15)
- **Critères** :
  1. Étant donné les équipements avec coordonnées sourcées, alors un marqueur (ou marqueur de site groupé) est affiché pour chacun ; aucun autre.
  2. Quand je navigue au clavier, alors chaque marqueur reçoit le focus et est annoncé « {nom}, {mission} ».
  3. Étant donné la carte, alors la légende « Simplified map — positions are approximate » et le crédit du fond sont visibles.

### US-3.4 — Carte et galerie synchronisées
- **Story** : En tant que visiteur, je souhaite que la carte et la liste se répondent afin de faire le lien entre un lieu et un équipement.
- **Priorité** : P0 · **Exigences** : SYNC-001, SYNC-002, SYNC-003
- **Critères** :
  1. Quand j'active un marqueur, alors la carte de galerie correspondante est mise en évidence et défile dans la vue.
  2. Quand j'active une carte de galerie dont l'équipement est localisé, alors son marqueur passe à l'état sélectionné (forme + contour, pas seulement couleur).
  3. Étant donné une erreur de rendu de la carte, alors un message s'affiche et la galerie reste utilisable (test automatisé).
  4. Test T3 du CDC réussi.

### US-3.5 — Aller directement à une mission
- **Story** : En tant que visiteur, je souhaite sauter à une mission précise afin de ne pas faire défiler toute la page.
- **Priorité** : P0 (léger) · **Exigences** : EQUIP-006 · **Statut** : `blocked` (OPEN-14)
- **Critères** : quand j'active « {Mission} » dans la barre « Jump to mission », alors la page défile jusqu'au groupe et le focus est placé sur son titre.

### US-3.6 — Explorer sur téléphone
- **Story** : En tant que visiteur sur téléphone, je souhaite que la carte ne me bloque pas afin d'accéder facilement aux fiches.
- **Priorité** : P0 · **Exigences** : MAP-005, NFR-RESP-001, NFR-A11Y-005
- **Critères** :
  1. Étant donné un écran de 360 × 740, alors la carte occupe ≤ 40 % de la hauteur ou est repliable via « Hide map ».
  2. Toutes les cibles interactives mesurent ≥ 44 × 44 px.
  3. La fiche détaillée s'ouvre en plein écran et se ferme sans précision de pointage.

### US-3.7 — Filtrer par statut *(P1)*
- **Story** : En tant que curieux, je souhaite filtrer les équipements par statut afin de voir, par exemple, ceux encore opérationnels.
- **Priorité** : P1 · **Exigences** : EQUIP-007 · **Statut** : `backlog`
- **Critères** : voir EQUIP-007.

---

## Epic E4 — Découvrir l'histoire (Phase 4)

### US-4.1 — Lire un récit en six étapes
- **Story** : En tant que visiteur, je souhaite un récit découpé en six étapes courtes afin de comprendre une mission sans lire un long texte.
- **Priorité** : P0 · **Exigences** : STORY-001, STORY-009, NFR-READ-001 · **Statut** : `review`
- **Critères** :
  1. Étant donné `/stories/{id}?step=1`, alors l'étape « Signal » s'affiche seule avec son titre.
  2. Étant donné un `step` absent ou invalide, alors l'étape 1 s'affiche.
  3. Étant donné les animations désactivées, alors toutes les étapes restent lisibles et complètes.

### US-4.2 — Naviguer dans le récit
- **Story** : En tant que visiteur, je souhaite avancer, reculer, voir où j'en suis et sortir à tout moment afin de garder le contrôle de ma lecture.
- **Priorité** : P0 · **Exigences** : STORY-004, STORY-005, STORY-006, NAV-003 · **Statut** : `review`
- **Critères** :
  1. Quand j'active « Next » à l'étape 2, alors l'étape 3 s'affiche, l'URL contient `step=3` et le focus est placé sur le titre de l'étape.
  2. Étant donné l'étape 1, alors « Previous » est désactivé ; étant donné l'étape 6, alors « Next » est remplacé par les choix de fin.
  3. Quand j'active « Exit story », alors je reviens à la destination avec l'équipement d'origine sélectionné.
  4. Le bouton retour du navigateur ramène à l'étape précédente.

### US-4.3 — Distinguer fait, interprétation et imagination
- **Story** : En tant que visiteur, je souhaite savoir si je lis un fait, une explication ou une mise en situation afin de ne pas confondre science et imagination.
- **Priorité** : P0 · **Exigences** : STORY-007, NFR-SCI-001, NFR-A11Y-004 · **Statut** : `review`
- **Critères** :
  1. Chaque bloc affiche son étiquette textuelle (« Fact », « What it means », « Imagine »).
  2. Un bloc `data` sans source fait échouer le test d'intégrité.

### US-4.4 — Vérifier une information depuis le récit
- **Story** : En tant que visiteur, je souhaite voir d'où vient une information sans quitter le récit afin de vérifier ce que je lis.
- **Priorité** : P0 · **Exigences** : SOURCE-002, SOURCE-003 · **Statut** : `review` (test T5 à faire par l'équipe)
- **Critères** :
  1. Quand j'active un `SourceBadge`, alors la source (organisme, titre, lien, date de consultation) s'affiche sans changer d'étape.
  2. Le lien externe s'ouvre dans un nouvel onglet, annoncé comme tel.
  3. Test T5 du CDC réussi.

### US-4.5 — Récit Lune *(contenu)*
- **Story** : En tant que visiteur, je souhaite découvrir l'histoire d'une mission lunaire et de ce qu'elle a transmis afin de comprendre l'héritage des machines laissées sur la Lune.
- **Priorité** : P0 · **Exigences** : STORY-002, STORY-010, SOURCE-005 · **Statut** : `review` — 2 récits Lune en `draft` : `moon-apollo11-retroreflectors`, `moon-surveyor-apollo12`
- **Critères** :
  1. Le récit (recommandé : Apollo 12 avec Surveyor 3) contient les 6 étapes et passe le test d'intégrité.
  2. Toute relation évoquée dans l'étape Relay existe dans `relations.json` avec preuve et source.
  3. Relecture scientifique croisée réalisée et consignée (QG-SCI).

### US-4.6 — Récit Mars *(contenu)*
- **Story** : En tant que visiteur, je souhaite découvrir l'histoire des rovers martiens et de ce qui a été transmis d'une mission à l'autre afin de comprendre la continuité de l'exploration.
- **Priorité** : P0 · **Exigences** : STORY-002, STORY-010, SOURCE-005 · **Statut** : `review` — 2 récits Mars en `draft` : `mars-spirit-opportunity`, `mars-ingenuity` (Ingenuity passe en P0, OPEN-08)
- **Critères** : identiques à US-4.5 pour le récit recommandé Mars Exploration Rover (Spirit, Opportunity) avec relais documenté depuis Sojourner.

### US-4.7 — Terminer un récit et approfondir
- **Story** : En tant que visiteur, je souhaite à la fin du récit pouvoir continuer vers la mission, les équipements liés ou l'autre destination afin de poursuivre mon exploration.
- **Priorité** : P0 · **Exigences** : STORY-002, STORY-008 · **Statut** : `review` (critère 2 sans objet tant qu'aucun récit individuel de machine n'existe)
- **Critères** :
  1. Étant donné l'étape 6, alors trois actions sont proposées : retour à la mission, équipements associés, autre destination.
  2. Étant donné un récit principal citant un équipement qui a un récit individuel, alors un lien vers ce récit est proposé.

### US-4.8 — Récit Ingenuity *(P1)*
- **Priorité** : P1 · **Exigences** : STORY-002 · **Statut** : `backlog` — uniquement si le P0 est livré et stable.

---

## Epic E5 — Transparence, qualité et publication (Phase 5, avec amorçage en phase 1)

### US-5.1 — Page About & Sources
- **Story** : En tant que curieux, je souhaite savoir qui a fait le site, avec quelles ressources et quelles sources afin de pouvoir lui faire confiance.
- **Priorité** : P0 · **Exigences** : ABOUT-001, SOURCE-004, NFR-LEGAL-001
- **Critères** :
  1. La page contient : crédits, licences (images, polices, icônes, bibliothèques, fonds de carte), usage de l'IA, la phrase exacte de non-affiliation, la liste des sources avec ancres.
  2. Aucun logo NASA n'est présent dans le dépôt ni dans le build (contrôle QG-LEGAL).

### US-5.2 — Fichiers légaux du dépôt
- **Priorité** : P0 · **Exigences** : ABOUT-002
- **Critères** : `README.md`, `LICENSE`, `THIRD_PARTY_LICENSES.md` présents et cohérents avec About.

### US-5.3 — Audit accessibilité et responsive
- **Priorité** : P0 · **Exigences** : NFR-A11Y-*, NFR-RESP-*
- **Critères** : gates QG-A11Y et QG-RESP passés sur les 4 pages ; anomalies bloquantes corrigées ; résultats consignés.

### US-5.4 — Vérification scientifique finale
- **Priorité** : P0 · **Exigences** : NFR-SCI-001, SOURCE-*
- **Critères** : gate QG-SCI passé pour 100 % du contenu publié ; liens de sources vérifiés (QG-LINKS).

### US-5.5 — Mise en production et démo
- **Priorité** : P0 · **Exigences** : DEPLOY-001, indicateurs PRD §11
- **Critères** : URL publique vérifiée en navigation privée sur 1 ordinateur et 2 formats de téléphone ; parcours de démo chronométré < 3 min ; plan de secours (galerie seule) répété.

---

## Matrice de traçabilité (exigences P0 → stories)

| Exigences | Stories |
|---|---|
| DEST-001, 003, 004, 005 | US-2.1 |
| DEST-002 | US-2.2 |
| NAV-001 → 005 | US-1.3, US-2.3, US-4.2 |
| EXPL-001, EQUIP-001, EQUIP-004 | US-3.1 |
| EQUIP-002, 003, 005 | US-3.2 |
| EQUIP-006 | US-3.5 |
| MAP-001, MAP-002, MAP-003, MAP-004, MAP-006 | US-3.3 |
| MAP-005 | US-3.6 |
| SYNC-001 → 003 | US-3.4 |
| STORY-001, 009 | US-4.1 |
| STORY-004 → 006 | US-4.2 |
| STORY-007 | US-4.3 |
| STORY-002, 010 | US-4.5, US-4.6, US-4.7 |
| STORY-003 | US-3.2 |
| STORY-008 | US-4.7 |
| SOURCE-001, 003 | US-1.5, US-1.8, US-5.4 |
| SOURCE-002 | US-3.2, US-4.4 |
| SOURCE-004 | US-5.1 |
| SOURCE-005 | US-4.5, US-4.6 |
| ABOUT-001, 002 | US-5.1, US-5.2, US-1.1 |
| DATA-001, DATA-002, DATA-003, DATA-004, DATA-005, DATA-006 | US-1.5, US-1.8 |
| DEPLOY-001, 002 | US-1.6, US-1.7, US-5.5 |
| *P1* : EQUIP-007 | US-3.7 |
| *P1* : MAP-007 | à rédiger après OPEN-09 |
