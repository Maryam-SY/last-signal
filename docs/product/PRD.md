# PRD — AeroReborn

> Rôle BMAD : Product Manager · Version 1.0 (Phase 0) · Statut : **en attente de validation**
> Source de vérité amont : `Last_Signal_Cahier_des_charges_v3_UX.pdf` (v3.0, 14/11/2026), cité « CDC §n ».
> Décisions ouvertes : `OPEN-xx` → [docs/project/AUDIT_PHASE0.md](../project/AUDIT_PHASE0.md#7-décisions-ouvertes-à-valider-par-léquipe).
>
> Règle : un identifiant d'exigence ne change jamais. Une exigence abandonnée est marquée « Retirée », pas supprimée.

## 1. Présentation

**AeroReborn** est une expérience web éducative et interactive qui fait découvrir les équipements humains restés sur la **Lune** et sur **Mars**, la mission qui les y a conduits, ce qu'ils ont permis d'apprendre et ce qu'ils ont transmis aux missions et connaissances suivantes.

> « Chaque machine a laissé plus qu'une trace : elle a transmis quelque chose. »

C'est un **site public**, sans compte, conçu d'abord pour mobile, composé d'un frontend React et d'une API Express (ADR-016 ; le CDC prévoyait un site statique, l'équipe a choisi un site dynamique).

## 2. Problème

- Les informations sur ces équipements existent (NASA, NSSDCA…) mais sous forme de catalogues techniques, en anglais spécialisé, peu accessibles à un public de 10-15 ans.
- Les contenus grand public racontent les missions, rarement **le devenir des machines** et la **chaîne de transmission** entre missions.
- Les contenus « storytelling » sur l'espace mélangent souvent faits, interprétations et fiction (fausses « dernières paroles » de robots, citations inventées).

## 3. Vision et objectifs

**Vision** : transformer un inventaire d'objets en une suite de récits courts, visuels et **sourcés**, où chaque fait est vérifiable.

| ID | Objectif produit | Mesure (voir §11) |
|---|---|---|
| OBJ-1 | Rendre le sujet compréhensible sans connaissance préalable | Tests UX T1, T4 |
| OBJ-2 | Offrir une progression simple : destination → équipements → récit | Tests UX T1, T2, T6 |
| OBJ-3 | Garantir l'exactitude scientifique et la traçabilité | 100 % des faits sourcés (contrôle automatique) |
| OBJ-4 | Être utilisable sur téléphone, ordinateur et au clavier | Gates QG-RESP, QG-A11Y |
| OBJ-5 | Livrer un MVP public stable pendant le hackathon | URL publique fonctionnelle en navigation privée |

## 4. Public cible

| Segment | Description | Besoins clés |
|---|---|---|
| **Principal** | Jeunes de 10 à 15 ans curieux d'espace | Vocabulaire expliqué, textes courts, visuels, sentiment d'exploration, pas d'infantilisation |
| Secondaire | Passionnés occasionnels, visiteurs curieux | Accès rapide aux faits, sources consultables |
| Tertiaire (démo) | Jury du hackathon | Parcours démontrable en < 3 min, rigueur visible |

**Ton** : accessible, curieux, sobre. Les termes techniques sont expliqués au moment où ils apparaissent.

## 5. Proposition de valeur

1. **Comprendre** plutôt que consulter : chaque équipement est relié à un « pourquoi », un « comment », une « découverte » et un « relais ».
2. **Faire confiance** : chaque fait affiché renvoie à une source ; faits, interprétations et imagination sont visuellement distingués.
3. **Explorer librement** : carte pour situer, galerie par mission pour trouver, sans jamais être obligé de comprendre la carte.

## 6. Parcours utilisateur principal

1. **Choose your destination** — choisir la Lune ou Mars.
2. **Explore** — repérer les équipements sur une carte 2D et dans une galerie groupée par mission, ouvrir une fiche.
3. **Discover the story** — parcourir le récit en six étapes de la mission (ou d'un équipement), puis revenir à l'exploration.

Diagrammes détaillés : [USER_FLOWS.md](USER_FLOWS.md). Navigation transversale : Explore et About/Sources toujours accessibles, fil d'Ariane, sortie du récit à tout moment.

## 7. Fonctionnalités (vue d'ensemble)

| Fonctionnalité | Exigences | Priorité |
|---|---|---|
| Sélecteur de destination | DEST-001 → 005 | P0 |
| Navigation globale, fil d'Ariane, URLs | NAV-001 → 005 | P0 |
| Page destination (en-tête) | EXPL-001 | P0 |
| Galerie groupée par mission, fiches | EQUIP-001 → 007 | P0 (EQUIP-007 : P1) |
| Carte interactive 2D | MAP-001 → 007 | P0 (MAP-007 : P1) |
| Synchronisation carte ↔ galerie | SYNC-001 → 003 | P0 |
| Récit en six étapes | STORY-001 → 010 | P0 |
| Sources et relations | SOURCE-001 → 005 | P0 |
| Page About / Sources | ABOUT-001 → 002 | P0 |
| Données et contenu | DATA-001 → 006 | P0 |
| Publication | DEPLOY-001 → 002 | P0 |

Le détail des niveaux de priorité est dans [SCOPE.md](SCOPE.md).

## 8. Exigences fonctionnelles

### 8.1 Destinations — `DEST`

#### DEST-001 — Écran de choix de destination
- **Priorité** : P0 · **Source** : CDC §3 · **Dépend de** : NAV-004
- **Objectif** : faire comprendre immédiatement que deux destinations sont explorables.
- **Critères d'acceptation** :
  1. La page d'accueil (`/`) affiche un titre court (« Choose your destination » ou équivalent validé) et une phrase d'introduction de 3 lignes maximum sur mobile (360 px).
  2. Deux choix exactement sont affichés : Moon et Mars, chacun avec une image, un nom lisible et une action explicite (« Explore the Moon », « Explore Mars »).
  3. Aucune autre destination n'est affichée, même désactivée.

#### DEST-002 — Indicateurs par destination
- **Priorité** : P0 · **Source** : CDC §3, §6 · **Dépend de** : DATA-001, OPEN-07
- **Objectif** : donner envie d'explorer avec une information concrète.
- **Critères d'acceptation** :
  1. Le nombre de missions et/ou d'équipements est **calculé depuis les données**, jamais saisi en dur.
  2. Tant que OPEN-07 n'est pas validé, l'indicateur est masqué par un drapeau de configuration (`showCounts: false`).

#### DEST-003 — Grande zone cliquable et états visibles
- **Priorité** : P0 · **Source** : CDC §3 · **Dépend de** : NFR-A11Y-002, NFR-A11Y-005
- **Critères d'acceptation** :
  1. Toute la carte de destination est activable (souris, toucher, `Entrée`/`Espace` au clavier), pas seulement un bouton.
  2. États survol, focus clavier et actif distincts ; le focus est visible sans survol.
  3. Aucune information essentielle n'est révélée uniquement au survol.

#### DEST-004 — Navigation vers la destination
- **Priorité** : P0 · **Source** : CDC §3 · **Dépend de** : NAV-004
- **Critères d'acceptation** :
  1. Choisir Moon mène à `/explore/moon`, Mars à `/explore/mars`.
  2. La transition éventuelle est désactivée si `prefers-reduced-motion: reduce`.
  3. Le bouton « retour » du navigateur ramène à l'accueil.

#### DEST-005 — Terminologie
- **Priorité** : P0 · **Source** : CDC §3
- **Critères d'acceptation** : les libellés génériques emploient « destination », « world » ou « territory », jamais « planet » pour désigner l'ensemble Lune + Mars.

### 8.2 Navigation — `NAV`

#### NAV-001 — Navigation principale
- **Priorité** : P0 · **Source** : CDC §2
- **Critères d'acceptation** : un en-tête présent sur toutes les pages donne accès à « Explore » (`/`) et « About & Sources » (`/about`), au clavier et au toucher.

#### NAV-002 — Fil d'Ariane
- **Priorité** : P0 · **Source** : CDC §2 · **Dépend de** : NAV-004
- **Critères d'acceptation** :
  1. Le fil reflète la position : `Explore › Moon › {Mission} › {Équipement} › Story` (segments absents si non pertinents).
  2. Chaque segment sauf le dernier est un lien ; le dernier porte `aria-current="page"`.
  3. Balisage `<nav aria-label="Breadcrumb">` avec liste ordonnée.

#### NAV-003 — Retours explicites
- **Priorité** : P0 · **Source** : CDC §2
- **Critères d'acceptation** : depuis une destination, un lien « Back to destinations » ; depuis un récit, un lien « Back to {destination} equipment » qui restaure l'équipement d'origine s'il existe.

#### NAV-004 — URLs adressables
- **Priorité** : P0 · **Source** : proposition d'architecture (soutient NAV-002, NAV-003, SYNC) · **Dépend de** : OPEN-04
- **Objectif** : rendre l'état partageable, compatible avec le bouton retour et démontrable.
- **Critères d'acceptation** :
  1. Routes : `/`, `/explore/:destinationId`, `/explore/:destinationId?machine=:machineId`, `/stories/:storyId?step=1..6`, `/about`, page 404.
  2. Recharger n'importe laquelle de ces URL sur le site déployé affiche la bonne vue (fallback SPA configuré).
  3. Un identifiant inconnu affiche une page « not found » avec lien vers l'accueil, sans erreur JavaScript.

#### NAV-005 — Libellés explicites
- **Priorité** : P0 · **Source** : CDC §2
- **Critères d'acceptation** : aucun bouton ou lien n'est constitué d'une icône seule sans texte visible, sauf contrôles universels (fermer) qui ont alors un nom accessible.

### 8.3 Exploration — `EXPL`, `EQUIP`, `MAP`, `SYNC`

#### EXPL-001 — En-tête de destination
- **Priorité** : P0 · **Source** : CDC §4.2
- **Critères d'acceptation** : nom de la destination (`<h1>`), contexte de 2 phrases maximum, lien de retour au choix des destinations.

#### EQUIP-001 — Équipements regroupés par mission
- **Priorité** : P0 · **Source** : CDC §4.1
- **Critères d'acceptation** :
  1. La galerie présente un groupe par mission de la destination (`<section>` titrée).
  2. Chaque groupe affiche : nom de mission, période **si elle est sourcée** (sinon rien), présentation courte, cartes de ses équipements.
  3. Ordre des groupes : chronologique quand la date est connue, sinon ordre défini dans les données.
  4. Un équipement apparaît dans un seul groupe.

#### EQUIP-002 — Carte résumé d'équipement (MachineCard)
- **Priorité** : P0 · **Source** : CDC §4.2, §4.4
- **Critères d'acceptation** : la carte affiche nom officiel, mission, année ou date, lieu, statut (EQUIP-005), une phrase scientifique, l'action « Discover its story » si un récit existe, et un accès aux sources. Un champ non sourcé n'est pas affiché.

#### EQUIP-003 — Fiche détaillée (MachineDetail)
- **Priorité** : P0 · **Source** : CDC §4.4, §4.5 · **Dépend de** : NAV-004
- **Critères d'acceptation** :
  1. Ouverture depuis une carte ou un marqueur ; URL `?machine=:id`.
  2. Desktop : panneau latéral ; mobile (< 768 px) : panneau plein écran ou feuille inférieure.
  3. Contient toutes les informations minimales du CDC §4.4, la liste des sources (organisme, titre, lien, date de consultation) et les relations documentées (SOURCE-005).
  4. Fermeture par bouton « Close », touche `Échap` ; le focus revient à l'élément déclencheur.

#### EQUIP-004 — Équipement sans localisation fiable
- **Priorité** : P0 · **Source** : CDC §4.3
- **Critères d'acceptation** : un équipement sans coordonnées sourcées apparaît dans la galerie avec la mention textuelle « Location not mapped » et sans marqueur.

#### EQUIP-005 — Statut compréhensible
- **Priorité** : P0 · **Source** : CDC §4.4, §7
- **Critères d'acceptation** :
  1. Le statut appartient à une liste fermée (voir DATA_MODEL `MachineStatus`) et est sourcé.
  2. Il est rendu par un **libellé texte + une icône**, la couleur n'étant qu'un renfort.
  3. « Mission ended », « Inactive », « Contact lost », « Operational » ne sont jamais confondus.

#### EQUIP-006 — Accès rapide par mission
- **Priorité** : P0 (léger) · **Source** : CDC §4.2 « Filtres simples » · **Dépend de** : OPEN-14
- **Critères d'acceptation** : une barre de liens « Jump to mission » permet d'atteindre chaque groupe de mission ; utilisable au clavier ; ne masque aucun contenu.

#### EQUIP-007 — Filtres complémentaires (statut, type)
- **Priorité** : P1 · **Source** : CDC §6
- **Critères d'acceptation** : filtrer par statut réduit la galerie et les marqueurs de manière cohérente ; un message s'affiche si aucun résultat ; l'état des filtres est reflété dans l'URL.

#### MAP-001 — Carte 2D de la destination
- **Priorité** : P0 · **Source** : CDC §4.2, §9 · **Dépend de** : OPEN-15
- **Objectif** : situer les équipements, sans en faire un passage obligé.
- **Critères d'acceptation** :
  1. Une carte 2D simplifiée (projection équirectangulaire) de la surface est affichée en SVG.
  2. Les marqueurs sont positionnés à partir des coordonnées sourcées (latitude/longitude) et rien d'autre.
  3. La carte se redimensionne sans déformation et sans défilement horizontal de la page.

#### MAP-002 — Marqueurs interactifs
- **Priorité** : P0 · **Source** : CDC §4.2, §8
- **Critères d'acceptation** :
  1. Chaque marqueur est un élément focusable avec un nom accessible (« {nom}, {mission} »).
  2. Zone d'activation ≥ 44 × 44 px CSS quelle que soit la taille de la carte.
  3. Le marqueur sélectionné se distingue par **forme ou contour et taille**, pas seulement par la couleur.
  4. Si plusieurs équipements partagent (à l'échelle de la carte) un même site, un marqueur de site unique liste les équipements concernés.

#### MAP-003 — Aucune coordonnée inventée
- **Priorité** : P0 · **Source** : CDC §4.3, §7
- **Critères d'acceptation** : le test d'intégrité échoue si une coordonnée n'a pas de source ; aucun marqueur n'est rendu pour `coordinates: null`.

#### MAP-004 — Carte présentée comme schématique
- **Priorité** : P0 · **Source** : CDC §8 « À ne pas faire »
- **Critères d'acceptation** : une légende visible indique « Simplified map — positions are approximate » et le crédit du fond de carte.

#### MAP-005 — Carte non bloquante sur mobile
- **Priorité** : P0 · **Source** : CDC §4.5
- **Critères d'acceptation** : à 360 px de large, la carte occupe au plus ~40 % de la hauteur visible ou est repliable ; la galerie est atteignable sans interagir avec la carte.

#### MAP-006 — Légende
- **Priorité** : P0 · **Source** : CDC §8
- **Critères d'acceptation** : la légende explique les symboles (site, sélection, statut) en texte.

#### MAP-007 — Tracés de relations sur la carte
- **Priorité** : P1 · **Source** : CDC §4.3, §11 · **Dépend de** : OPEN-09, SOURCE-005
- **Critères d'acceptation** : seules les relations documentées sont tracées ; chaque tracé a un libellé ou une liste textuelle équivalente expliquant ce qui a été transmis, avec source.

#### SYNC-001 — Carte → galerie
- **Priorité** : P0 · **Source** : CDC §4.3
- **Critères d'acceptation** : activer un marqueur sélectionne l'équipement, met en évidence sa carte dans la galerie, la fait défiler dans la vue (sans animation si mouvement réduit) et ouvre l'aperçu.

#### SYNC-002 — Galerie → carte
- **Priorité** : P0 · **Source** : CDC §4.3
- **Critères d'acceptation** : sélectionner une carte met en évidence le marqueur correspondant s'il existe ; sinon la carte n'affiche aucune sélection et la fiche indique « Location not mapped ».

#### SYNC-003 — Galerie autonome
- **Priorité** : P0 · **Source** : CDC §4.3, §8 « Alternative », §9 « plan de secours »
- **Critères d'acceptation** : si la carte échoue (erreur de rendu capturée par un error boundary) ou est masquée, la galerie, les fiches et les récits restent entièrement utilisables.

### 8.4 Récit — `STORY`

#### STORY-001 — Six étapes
- **Priorité** : P0 · **Source** : CDC §5.1
- **Critères d'acceptation** : tout récit publié contient exactement les étapes `signal`, `why`, `how`, `discovery`, `relay`, `your-turn`, dans cet ordre (validé par test), avec les intitulés affichés Signal / Why / How / Discovery / Relay / Your turn (ou équivalents validés OPEN-06).

#### STORY-002 — Récit principal et récits individuels
- **Priorité** : P0 · **Source** : CDC §5 · **Dépend de** : OPEN-08, OPEN-16
- **Critères d'acceptation** :
  1. Une mission a 0 ou 1 récit principal (`kind: "mission"`).
  2. Un équipement peut avoir 0..n récits individuels (`kind: "machine"`).
  3. Le récit principal propose des accès aux récits individuels des équipements cités, sans les intégrer.

#### STORY-003 — Entrée depuis la fiche
- **Priorité** : P0 · **Source** : CDC §5
- **Critères d'acceptation** : « Discover its story » ouvre le récit individuel de l'équipement s'il existe, sinon le récit principal de sa mission ; le bouton est absent si aucun des deux n'existe.

#### STORY-004 — Indicateur de progression
- **Priorité** : P0 · **Source** : CDC §5.3
- **Critères d'acceptation** : une liste ordonnée des 6 étapes indique l'étape courante (texte + `aria-current="step"`), et permet d'y sauter directement.

#### STORY-005 — Précédent / Suivant
- **Priorité** : P0 · **Source** : CDC §5.3
- **Critères d'acceptation** : boutons « Previous » et « Next » toujours présents (désactivés aux bornes) ; la progression ne dépend jamais exclusivement du défilement ; l'étape est reflétée dans l'URL (`?step=`).

#### STORY-006 — Quitter le récit
- **Priorité** : P0 · **Source** : CDC §2, §5.3
- **Critères d'acceptation** : un lien « Exit story » est visible à chaque étape et ramène à la destination avec l'équipement d'origine sélectionné.

#### STORY-007 — Trois voix narratives
- **Priorité** : P0 · **Source** : CDC §5.2
- **Critères d'acceptation** :
  1. Chaque bloc de texte porte une voix : `data`, `interpretation` ou `imagination`, rendue par un `VoiceTag` textuel (« Fact », « What it means », « Imagine »).
  2. Un bloc `data` a au moins une source (test bloquant).
  3. Aucun bloc ne contient de paroles, pensées ou témoignages attribués à une machine ou une personne sans citation sourcée (relecture QG-SCI).

#### STORY-008 — Fin de récit
- **Priorité** : P0 · **Source** : CDC §5.3
- **Critères d'acceptation** : la dernière étape propose : retour à la mission, équipements associés, et l'autre destination.

#### STORY-009 — Expérience sans animation
- **Priorité** : P0 · **Source** : CDC §5.3, §8
- **Critères d'acceptation** : le récit est complet et compréhensible avec les animations désactivées (`prefers-reduced-motion`) ou CSS d'animation retiré.

#### STORY-010 — Récits du MVP
- **Priorité** : P0 · **Source** : CDC §6 · **Dépend de** : OPEN-08
- **Critères d'acceptation** : au minimum un récit complet par destination est publié (recommandation : Apollo 12 avec Surveyor 3 ; Mars Exploration Rover avec relais Sojourner), relu selon QG-SCI.

### 8.5 Sources et relations — `SOURCE`

#### SOURCE-001 — Tout fait est sourcé
- **Priorité** : P0 · **Source** : CDC §7
- **Critères d'acceptation** : dates, lieux, coordonnées, statuts, phrases scientifiques, blocs `data` et relations référencent ≥ 1 source existante ; le test d'intégrité échoue sinon.

#### SOURCE-002 — Sources consultables sans quitter la lecture
- **Priorité** : P0 · **Source** : CDC §5.3
- **Critères d'acceptation** : un `SourceBadge` à côté du fait ouvre une liste (popover ou section dépliable) avec organisme, titre, lien externe (`rel="noopener noreferrer"`, nouvel onglet annoncé) et date de consultation.

#### SOURCE-003 — Fiche source complète
- **Priorité** : P0 · **Source** : CDC §7
- **Critères d'acceptation** : chaque source a `organization`, `title`, `url`, `accessedOn` (AAAA-MM-JJ) ; l'URL répond (contrôle de liens QG-LINKS).

#### SOURCE-004 — Liste globale des sources
- **Priorité** : P0 · **Source** : CDC §2 « About / Sources »
- **Critères d'acceptation** : `/about` liste toutes les sources utilisées, groupées par destination ou mission, chacune avec une ancre `#source-{id}`.

#### SOURCE-005 — Relations documentées
- **Priorité** : P0 · **Source** : CDC §4.3, §7
- **Critères d'acceptation** : une relation précise origine, cible, type (méthode, technologie, données, connaissance, inspiration), **ce qui a été transmis**, **la preuve** et ≥ 1 source ; elle n'est jamais déduite d'une proximité chronologique.

### 8.5 bis Médias et chronologies — `MEDIA`, `TIMELINE`

#### MEDIA-001 — Nature des médias toujours visible
- **Priorité** : P0 · **Source** : CDC §8 (« ne pas confondre visuel d'ambiance et preuve scientifique »), demande de l'équipe du 2026-11-14
- **Objectif** : qu'aucune vue d'artiste, simulation ou animation ne soit prise pour une photo.
- **Critères d'acceptation** :
  1. Chaque média a un champ `depiction` ∈ photo, artwork, simulation, diagram, mixed, document (test d'intégrité bloquant).
  2. Pour toute valeur autre que `photo` et `document`, un badge textuel visible (pas seulement une infobulle) est affiché à côté du média, dans la galerie, la fiche, le récit et la chronologie.
  3. Le texte alternatif d'une vue d'artiste ou d'une simulation le précise (« pas une photo »).

#### TIMELINE-001 — Chronologie de chaque mission
- **Priorité** : P0 · **Source** : demande de l'équipe du 2026-11-14
- **Objectif** : raconter chaque mission étape par étape (lancement, atterrissage, travaux, découvertes, fin), simplement et avec des images.
- **Critères d'acceptation** :
  1. `GET /api/missions/:id` renvoie `timeline[]` dans l'ordre chronologique : date sourcée, titre, explication simple (fr/en), images résolues.
  2. Chaque date a au moins une source ; les dates partielles (mois, année) sont autorisées.
  3. Les images d'une étape appartiennent à la mission (règle V13).
  4. L'interface affiche la chronologie sur la fiche mission ou équipement, utilisable au clavier et sur mobile.

### 8.6 À propos — `ABOUT`

#### ABOUT-001 — Page About & Sources
- **Priorité** : P0 · **Source** : CDC §7, §9
- **Critères d'acceptation** :
  1. Crédits de l'équipe (sans données de mineurs).
  2. Licences des images, polices, icônes, bibliothèques et fonds de carte.
  3. Déclaration d'usage de l'IA ; médias générés marqués « AI-generated ».
  4. Texte exact : « Independent project, not affiliated with or endorsed by NASA ».
  5. Aucun logo NASA ni formulation laissant croire à un projet officiel.
  6. Liste des sources (SOURCE-004).

#### ABOUT-002 — Fichiers légaux du dépôt
- **Priorité** : P0 · **Source** : CDC §9
- **Critères d'acceptation** : `README.md`, `LICENSE` et `THIRD_PARTY_LICENSES.md` à la racine, cohérents avec la page About.

### 8.7 Données — `DATA`

#### DATA-001 — Contenu séparé du code
- **Priorité** : P0 · **Source** : CDC §7
- **Critères d'acceptation** : tout le contenu éditorial et scientifique vit dans `frontend/content/*.json` ; aucun fait scientifique en dur dans les composants.

#### DATA-002 — Identifiants stables
- **Priorité** : P0 · **Source** : CDC §7
- **Critères d'acceptation** : identifiants uniques par collection, en `kebab-case` ASCII, jamais renommés après publication (utilisés dans les URL).

#### DATA-003 — Intégrité vérifiée automatiquement
- **Priorité** : P0 · **Dépend de** : OPEN-17
- **Critères d'acceptation** : `npm test` exécute un test d'intégrité du contenu qui vérifie unicité, références, sources, bornes des coordonnées, structure des récits ; la CI échoue en cas d'erreur.

#### DATA-004 — Valeurs inconnues explicites
- **Priorité** : P0 · **Source** : CDC §7
- **Critères d'acceptation** : un fait non vérifié vaut `null` (et n'est pas affiché) plutôt qu'une approximation non sourcée.

#### DATA-005 — Périmètre Lune/Mars
- **Priorité** : P0 · **Source** : CDC §6
- **Critères d'acceptation** : `destinationId` ∈ {`moon`, `mars`} ; aucun objet de l'espace profond, de Vesta, Cérès, Éros ou de l'orbite solaire ; Pioneer 10 absent.

#### DATA-006 — Statuts différenciés
- **Priorité** : P0 · **Source** : CDC §7
- **Critères d'acceptation** : liste fermée de statuts définie dans DATA_MODEL ; ajout d'un statut = décision tracée (ADR).

### 8.8 Publication — `DEPLOY`

#### DEPLOY-001 — Site public sans compte
- **Priorité** : P0 · **Source** : CDC §6, §9 · **Dépend de** : OPEN-05
- **Critères d'acceptation** : une URL publique HTTPS sert le site ; parcours complet vérifié en navigation privée ; aucune authentification, aucun cookie de suivi.

#### DEPLOY-002 — Contrôles automatisés
- **Priorité** : P0 · **Source** : CDC §9
- **Critères d'acceptation** : un workflow GitHub Actions exécute lint, typecheck, tests et build sur chaque PR et sur `main` ; une PR rouge n'est pas fusionnée.

## 9. Exigences non fonctionnelles

| ID | Exigence | Critère vérifiable | Source |
|---|---|---|---|
| NFR-A11Y-001 | Parcours clavier complet | Les 3 étapes + About réalisables au clavier seul, ordre de tabulation logique | CDC §8 |
| NFR-A11Y-002 | Focus visible | Indicateur de focus ≥ 2 px, contraste ≥ 3:1 sur tous les éléments interactifs | CDC §8 |
| NFR-A11Y-003 | Contrastes | Texte courant ≥ 4,5:1 ; grand texte et composants d'interface ≥ 3:1 | CDC §8 |
| NFR-A11Y-004 | Pas d'information par la couleur seule | Statuts, sélection, voix : texte et/ou forme en plus de la couleur | CDC §8 |
| NFR-A11Y-005 | Cibles tactiles | ≥ 44 × 44 px CSS, espacement ≥ 8 px | CDC §8 |
| NFR-A11Y-006 | Mouvement réduit | Avec `prefers-reduced-motion: reduce`, aucune animation non essentielle, défilement instantané | CDC §8 |
| NFR-A11Y-007 | Pas d'information au survol seul | Aucune information essentielle n'exige le survol | CDC §3, §8 |
| NFR-A11Y-008 | Sémantique | Un `<h1>` par page, landmarks, `alt` pertinent ou vide pour le décoratif, `lang` du document correct | WCAG 2.2 AA |
| NFR-RESP-001 | Mobile-first | Aucun défilement horizontal de 320 px à 1440 px | CDC §8 |
| NFR-RESP-002 | Carte non bloquante | Voir MAP-005 | CDC §4.5 |
| NFR-PERF-001 | Médias optimisés | Images en WebP/AVIF ≤ 300 Ko (fonds de carte ≤ 500 Ko), `loading="lazy"` hors écran initial | CDC §8 |
| NFR-PERF-002 | Budget | Lighthouse mobile Performance ≥ 80 et JS initial ≤ 200 Ko gzip (cibles proposées, à valider) | Proposition |
| NFR-READ-001 | Lisibilité | Paragraphes ≤ 3 phrases dans les récits ; termes techniques expliqués à leur première occurrence | CDC §1, §8 |
| NFR-SCI-001 | Rigueur | Aucun fait, date, coordonnée, statut, relation ou citation inventé ; séparation des 3 voix | CDC §5.2, §7 |
| NFR-LEGAL-001 | Droits et vie privée | Crédits complets ; aucune donnée personnelle collectée ; aucun mineur dans le projet ou la démo | CDC §7, §10 |
| NFR-MAINT-001 | Maintenabilité | TypeScript strict, composants réutilisables, aucune donnée scientifique dans le code | CDC §9 |

## 10. Contraintes

### 10.1 Scientifiques
- Ne jamais inventer : coordonnées, dates, événements, statuts, relations de transmission, découvertes, citations ou témoignages.
- Distinguer **fait sourcé** (`data`), **interprétation pédagogique** (`interpretation`), **élément imaginatif** (`imagination`).
- Vérifier dates, lieux et statuts dans les ressources NASA / NSSDCA pertinentes, avec date de consultation.
- Revérifier individuellement chaque source héritée du CDC v2 (cas « Apollo 11 LM » pour Apollo 12).
- Pas d'objets hors Lune/Mars dans le parcours principal ; Pioneer 10 hors périmètre.

### 10.2 UX et accessibilité
- Exigences NFR-A11Y-*, NFR-RESP-*, et la liste « À ne pas faire » du CDC §8 (carte surchargée, carte obligatoire, longs blocs, info au survol, carte schématique présentée comme précise).
- Direction visuelle : identité COSMOS (palette sombre, accents mesurés) — voir [DESIGN_SYSTEM.md](../design/DESIGN_SYSTEM.md).

### 10.3 Techniques
- Frontend + API Express, sans base de données dans le MVP (ADR-016, écart assumé avec le CDC §7) ; rôle de l'API : OPEN-18.
- Choix d'animation narrative non tranché (OPEN-10).

## 11. Indicateurs de réussite

| Indicateur | Cible | Méthode |
|---|---|---|
| Tests UX rapides (CDC §10 : T1 compréhension, T2 découverte, T3 carte/galerie, T4 récit, T5 sources, T6 retour) | ≥ 5/6 réussis sans aide, avec ≥ 3 testeurs adultes | Protocole CDC §10, sans collecte de données personnelles |
| Faits sourcés | 100 % | Test d'intégrité (DATA-003) |
| Liens de sources valides | 100 % | Contrôle QG-LINKS |
| Accessibilité | Lighthouse Accessibility ≥ 95 sur les 4 pages + checklist clavier OK | QG-A11Y |
| Stabilité | 0 erreur console sur le parcours de démo | QG-SMOKE |
| Démo | Parcours complet Moon → fiche → récit → retour → Mars en < 3 min | Répétition chronométrée |

## 12. Hors périmètre (MVP)

- Destinations autres que Lune et Mars, objets de l'espace profond, orbite solaire, Vesta, Cérès, Éros ; **Pioneer 10**.
- Comptes, authentification, base de données, CMS, analytics personnelles.
- Carte 3D, globe, moteur cartographique (Leaflet, MapLibre…).
- Audio, quiz, PWA hors ligne, traduction française complète, animations scroll/parallax avancées dans les récits (P2 ; l'accueil fait exception, ADR-018).
- Toute fonctionnalité P1 tant que le P0 n'a pas passé les gates de phase (voir [SCOPE.md](SCOPE.md)).

## 13. Traçabilité

- Exigences → stories : [USER_STORIES.md](USER_STORIES.md) (colonne « Exigences »).
- Exigences → gates : [QUALITY_GATES.md](../quality/QUALITY_GATES.md).
- Exigences → phases : [IMPLEMENTATION_PLAN.md](../project/IMPLEMENTATION_PLAN.md).
