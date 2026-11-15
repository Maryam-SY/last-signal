# US-5.13 — Le récit complet de chaque machine

- **Statut** : review
- **Epic** : E5 — Transparence, qualité et publication
- **Priorité** : P0 (décision de l'équipe du 2026-11-15)
- **Exigences PRD** : EQUIP-002, MEDIA-001, ABOUT-001, NFR-A11Y-006
- **Décisions liées** : ADR-024 (nouvelle), ADR-023 ; règle de contenu V17 (DATA_MODEL)
- **Branche** : `feat/US-5.12-machine-lives` (suite directe d'US-5.12, non encore fusionnée) · **Cible** : `main`

## Demandes de l'équipe (2026-11-15)

1. Pendant la narration, surligner le texte lu et faire défiler la page avec la voix.
2. À partir des pages NASA / NSSDCA listées par l'équipe, une description complète de chaque machine (images, photos, textes explicites en mots simples, pas des indices) ; aucune mention de source dans les textes (elles vont sur la page À propos).

Choix de l'équipe : seulement les 11 machines déjà présentes ; engins hors Lune/Mars laissés de côté ; « Oui, ses propres chapitres » (nouveau champ `biography`, ADR-024).

## Partie 1 — la page suit la lecture (critère 1)

Demande de l'équipe : pendant la narration, surligner le texte lu et faire défiler la page avec la voix.

- `lib/readAlong.ts` : les textes lus sont marqués `data-narrate` dans la page (ordre de la page, `data-narrate-text` pour une phrase parlée différente, ex. « 57 fois plus longtemps que prévu ») ; le texte lu reçoit `data-narrating` (surbrillance), le mot prononcé est marqué par l'API CSS Custom Highlight (sans toucher au DOM ; ignoré si le navigateur ne l'a pas) ; la page défile pour garder le texte au milieu de l'écran. Le vol de photos déclare sa propre façon d'être atteint (la caméra vole jusqu'au moment lu).
- `NarrationButton` lit ce qui est affiché (plus de liste de textes en double) ; une barre « Lecture en cours · Arrêter » reste à l'écran ; si le visiteur fait défiler lui-même, la page le laisse faire 5 s.
- Retrait de la ligne « Ces dates et ces chiffres sont en cours de vérification… à partir de leurs sources » sous la ligne de vie (les sources sont sur la page À propos).

| Contrôle | Résultat réel |
|---|---|
| Frontend lint / typecheck | 0 erreur (mêmes 3 avertissements qu'avant) |
| Frontend tests | 71/71 (+4 : `narration.test.tsx`, voix simulée) |
| Frontend build | OK |
| Navigateur (page Opportunity) | la voix lit, le texte lu et le mot prononcé sont surlignés, la page défile (0 → 162 → 610 → … px) ; dans le vol de photos chaque moment lu amène sa photo (1938, 2514, 3663 px = positions attendues) |

## Partie 2 — biographie de chaque machine (critères 2 à 4)

- Modèle : `Machine.biography` (types backend + frontend), règle V17 (`validate.ts`), 2 tests V17 ; page machine : section « Qui est-il » + chapitres de la biographie dans le vol de photos (repli sur la frise de la mission sans biographie), 1 test de page.
- Contenu : biographies `draft` intégrées pour les 5 machines de Mars (Spirit 12 chapitres, Opportunity 12, lander Pathfinder 11, Sojourner 12, Ingenuity 12), 35 nouvelles photos (14 photos existantes réutilisées, aucun doublon), 80 nouvelles sources (date de consultation 2026-11-15). Lune : 6 machines intégrées (51 chapitres, 20 nouvelles photos, 40 sources) ; les photos nouvelles qui montrent plusieurs machines sont rattachées à chacune.

### Conflits et points à faire vérifier par un humain (contenu Mars)

- Spirit : enlisé le 23 avril 2009 (NSSDCA, PIA12142) ou le 1er mai 2009 (NASA Science) ; fin de mission 2010 (page MER) ou 25 mai 2011 (JPL).
- Opportunity : masse 185 kg ou 174 kg ; distance prévue 1 000 m ou 600 m ; « record dépassé par Perseverance le 11 octobre 2026 » (pages NASA Science, à revérifier).
- Pathfinder : diamètre des airbags 5,2 m ou 5,8 m, premier rebond 12 m ou 15 m, masse 463 / 264 / ~360 kg (masse laissée hors du texte).
- Sojourner : 10,6 kg ou 10,5 kg ; 28 ou 30 cm de haut. Le nom de l'élève qui l'a baptisé n'est pas cité (CLAUDE.md §7).
- Ingenuity : vitesse des pales ~2 400 ou ~3 000 tr/min ; vol 25 le 8 ou le 18 avril 2022 (8 avril retenu). Conversions °C et km/h faites à partir des sources.

## Partie 3 — demandes du 2026-11-15 (suite)

- Intro : fin sur « The Next Frontier » en gros plan (3,4 s) puis fondu vers le site ; bande-son synthétisée (`lib/introSound.ts`) ; bouton « Activer le son » si le navigateur la bloque.
- Accueil : sur-titre et boutons retirés (la planète est le lien) ; planètes plus grandes et plus lumineuses ; rotation à la vitesse réelle relative (NSSDCA, 1 s = 1 h) ; « Faites défiler pour explorer » + flèche. Après retour de l'équipe : Terre de comparaison, libellés « satellite naturel / planète tellurique », durées et souris animée retirés ; indication discrète dans les scènes Lune/Mars.
  - Note scientifique : Mars tourne un peu **moins** vite que la Terre (24 h 37 min contre 23 h 56 min) et la Lune bien moins vite (27,3 jours) — l'animation montre ces vraies vitesses.
- Destination : frise limitée aux étapes des missions de ce monde (`WorldTimeline`) ; carte du journal d'explorateur retirée de l'affichage.
- Page machine : bouton « Lire son récit en 6 étapes » retiré ; le récit est raconté sur la page en diapositives alternées (`StorySlides`), autant que le récit en a.
- Lisibilité : `reading-panel` (fond plus opaque) sur les textes longs (vol de photos, récit, frise, présentation) et `text-legible` (halo) pour le texte posé sur le ciel.

| Contrôle | Résultat réel |
|---|---|
| Frontend `npm run check` | lint 0 erreur (3 avertissements préexistants), typecheck 0 erreur, 72/72 tests, build OK |
| Backend `npm run check` | 57/57 ; `content:check` 0 erreur |
| Navigateur | intro → « The Next Frontier » ; accueil 1440×900 et largeur mobile sans débordement ; frise de Mars seule ; page Spirit : présentation + 12 chapitres propres, récit en diapositives alternées |
| Non vérifié | mouvement des diapositives et son de l'intro (panneau du navigateur masqué : animations en pause ; pas de sortie audio pour l'agent) |

## Partie 4 — retours du 2026-11-15 (fin)

- Photo de la machine à côté de sa présentation (`MachinePortrait`, pseudo-3D au pointeur), en premier sur téléphone.
- Trait entre les années du hangar : il s'allonge en prenant de la place au lieu de passer sur l'année de fin.
- « Comment on le sait » retiré des héritages et des relais.
- Sélecteur de langue en menu déroulant (clavier : flèches, Échap).
- Plus d'images : chaque photo d'un chapitre devient une étape du vol ; compteur « Jour N de sa mission ». Recherche complémentaire en cours (plus de chapitres et 15 à 45 photos par machine, éléments « Pour nous, sur Terre »).
- Pièces importantes : modèle `parts` (V18), points touchables sur la photo et sur le modèle 3D, avec nom et description animés ; recherche des pièces en cours.
- Immersion : transitions de page en fondu-zoom, sections qui se fondent au défilement, bords du vol de photos adoucis.
- Mobile : en-tête compact (libellé court « À propos », plus de chevauchement), liens longs de la page À propos qui passent à la ligne ; sur téléphone, la photo est le fond du texte sous un masque (vol de photos, diapositives). Contrôle : aucune largeur > 375 px sur Accueil, Opportunity, À propos.

| Contrôle | Résultat réel |
|---|---|
| Frontend `npm run check` | 0 erreur de lint, typecheck OK, 72/72, build OK |
| Backend tests validation | 33/33 (2 tests V17/V18 ajoutés) |
| Non vérifié | animations liées au défilement sur téléphone (panneau du navigateur masqué), son de l'intro |

### Lune — version étendue intégrée (2026-11-15)

- 78 chapitres (Surveyor 3 : 15, Eagle : 12, EASEP : 11, LRRR : 12, Intrepid : 13, ALSEP : 15), 30 nouvelles photos (65 existantes réutilisées), 30 nouvelles sources, 24 éléments « Pour nous, sur Terre » ; 0 erreur de validation, aucun doublon.
- Non rattachées : `nasa-lib-as11-40-5942`, `nasa-lib-as11-37-5551`, `nasa-lib-as11-40-5948` montrent aussi le réflecteur (LRRR) mais restent rattachées à leur machine d'origine (donnée publiée : décision humaine).
- À revérifier : deux citations JPL 2004 lues via un résumé (site bloqué) ; contradictions : taille de l'étage de descente d'Eagle (NSSDCA vs dossier de presse), texte de la plaque (« on » / « upon »), durée prévue de l'ALSEP (« au moins un an » / « deux ans »), masse de Surveyor 3, distance Intrepid–Surveyor 3.
- Aucune photo prise par Surveyor 3 lui-même en 1967 trouvée sur les sites NASA accessibles.

### Pièces des machines intégrées (2026-11-15)

- 59 pièces (`parts`, `draft`) sur les 11 machines, 7 nouvelles sources ; positions sur photo vérifiées visuellement par l'agent (images de contrôle dans le dossier de travail) ; 18 pièces placées sur les modèles 3D (module lunaire, Ingenuity) par calcul des boîtes englobantes du fichier .glb.
- À vérifier : Spirit et Opportunity utilisent une infographie NASA (`diagram`, badge « Schéma ») faute de photo montrant leurs pièces ; LRRR : 2 pièces seulement (image de 232 px) ; placements de confiance moyenne : panneau solaire / antenne de Surveyor 3, bras de Surveyor, MESA d'Apollo 12, APXS de Sojourner, bras des MER. Le modèle du module lunaire n'est pas à l'échelle réelle (≈ 0,68×) ; ses nœuds ont des noms génériques (placement par taille et position).
- Navigateur : sur la photo d'Ingenuity, les 5 points tombent sur les rotors, le panneau, le corps et les jambes ; le toucher ouvre nom et description. Modèle 3D non vérifié visuellement (panneau masqué : le lecteur 3D ne se charge pas).

### Mars — version étendue intégrée (2026-11-15)

- Spirit 25 chapitres / 44 photos / 6 « Pour nous, sur Terre » ; Opportunity 28 / 45 / 5 ; Ingenuity 25 / 35 / 5 ; Sojourner 16 / 18 / 4 ; atterrisseur Pathfinder 15 / 16 / 5. 0 erreur de validation, aucun doublon ; les pièces (`parts`) sont conservées.
- Corrigé (MEDIA-001, accord de l'équipe le 2026-11-15) : `nasa-lib-pia14134`, vue 3D calculée par ordinateur, passe de `photo` à `simulation` ; elle porte désormais le badge « Image de synthèse — pas une photo ».
- Contradictions principales : sommet de Husband Hill (21 août / 29 sept. / 1–3 oct. 2005), roue de Spirit (2004–2006 / 2007), enlisement (23 avril / 1er mai 2009), tempête de 2018 (30 mai / 1er juin), Marquette Island (météorite / roche de la croûte), vitesse des pales d'Ingenuity (2 400 / 2 537 / ~3 000 tr/min), pic de visites du site Pathfinder en 1997, taille et masse de Sojourner.
- Écartées par la recherche : photo PIA04849 (insignes NASA sur les roues) ; liens Spinoff trop faibles ; aucun nom d'enfant ni « dernières paroles ».

### Retours du 2026-11-15 (soir)

- Mobile : défilement raccourci dans le vol de photos (0,55 écran par moment au lieu de 0,9) et un point d'aimant par moment (`scroll-snap`, proximité) : un geste = un moment.
- Superpositions : le panneau de lecture a la hauteur du seul moment affiché (les autres se superposent le temps de leur fondu) ; le compteur de mission est dans l'en-tête du panneau ; masque plus sombre derrière le texte sur téléphone.
- Pièces : sur grand écran, la fiche s'ouvre sur la photo (ou sur la vue 3D), à côté du point ; sur téléphone, sous l'image. Pièces affichées seulement pour les machines qui ont un vrai modèle 3D (décision de l'équipe) ; les données restent dans le contenu.
- Vol de photos : seules les photos proches de celle qui est à l'écran sont chargées (jusqu'à 47 photos par machine).

| Contrôle | Résultat réel |
|---|---|
| Frontend `npm run check` | 0 erreur, 72/72, build OK |
| Backend `npm run check` | 59/59, `content:check` 0 erreur |
| Navigateur | Ingenuity (PC) : fiche « Corps (fuselage) » sur la photo ; Spirit : aucun point ; Opportunity : 47 moments |
| Non vérifié | aimant de défilement et rendu mobile en mouvement (panneau du navigateur masqué), modèle 3D |
