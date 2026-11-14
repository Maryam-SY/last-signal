# Relecture scientifique du contenu — lot 1 (4 histoires)

> Rôles BMAD : Analyst (recherche) + QA (QG-SCI) · Date : 2026-11-14 · Statut : **à relire par un humain**
> Contenu : `backend/content/` · Document de l'équipe : `AeroReborn_Appareils_et_missions.docx`
> Règle : seul un humain passe un récit de `draft` à `reviewed` (CLAUDE.md §7).

## 1. Ce qui a été fait

- **Sources lues directement** (HTML brut ou lecture web), le 2026-11-14 : 17 sources, listées dans `backend/content/sources.json` (NSSDCA, NASA Science, JPL et une source de presse). Chaque fait affiché cite au moins une de ces sources (test d'intégrité bloquant).
- **Médias** : 56 références (42 images, 5 animations, 5 vidéos, 2 modèles 3D, 2 PDF), avec la légende et le crédit **recopiés tels quels** depuis la page source. Les fichiers **ne sont pas téléchargés** dans le dépôt : voir ADR-017.
- **Textes** : récits en anglais et en français, rédigés à partir du document de l'équipe et **réduits à ce que les sources confirment**.

## 2. Réponses à la liste « À vérifier » du document de l'équipe

| Point demandé | Réponse | Source |
|---|---|---|
| Date d'atterrissage de Surveyor 3 | 20 avril 1967 (atterrissage final à 00:04:53 UT, après deux rebonds) | NSSDCA 1967-035A, NASA Science |
| Pièces rapportées par Apollo 12 | Environ 10 kg de pièces, dont la caméra de télévision et la pelle (« soil scoop ») | NSSDCA 1967-035A, NASA Science |
| Ensemble d'instruments du réflecteur d'Apollo 11 | Le réflecteur (LRRR) était rattaché à l'**EASEP**, et non à l'ALSEP ; l'EASEP est décrit comme le précurseur des ALSEP | NSSDCA 1969-059C |
| Date d'arrêt des stations ALSEP | 30 septembre 1977 | NSSDCA 1969-099C |
| Vitesse d'éloignement de la Lune | Environ 3,8 cm par an | JPL (1999) |
| Durée prévue de Spirit et Opportunity | 90 jours martiens (environ trois mois) | JPL (2019), NASA Science |
| Distance parcourue par Opportunity | Plus de 45 km (28,06 miles / 45,16 km selon NASA Science) | JPL (2019), NASA Science |
| Dernier contact de Spirit | Dernière transmission le 22 mars 2010, enlisé depuis 2009 | NSSDCA 2003-027A |
| Dernier contact d'Opportunity | 10 juin 2018 ; fin de mission déclarée le 13 février 2019 | JPL (2019), NSSDCA 2003-032A |
| Origine de « my battery is low… » | Ce n'est pas un message du rover : un journaliste scientifique (Jacob Margolis) a résumé ce que des scientifiques de la NASA lui ont dit des dernières données | ABC7 (2019) — **source de presse**, le reportage d'origine (LAist) n'a pas pu être lu |
| Vols prévus et réalisés par Ingenuity | Au plus 5 vols d'essai en 30 jours prévus ; 72 vols réalisés | NASA Science |
| Date du dernier vol d'Ingenuity | 18 janvier 2024 (rotors endommagés) ; fin de mission le 25 janvier 2024 | NSSDCA 2020-052A, NASA Science |
| Missions qui reprennent l'héritage d'Ingenuity | **SkyFall** est la seule mission explicitement reliée à Ingenuity par la page NASA consultée | NASA Science (page Ingenuity) |

## 3. Écarts entre le document de l'équipe et les sources

| Affirmation du document | Traitement dans le contenu | Raison |
|---|---|---|
| Les missions Apollo suivantes laissent « d'autres réflecteurs » | **Retirée** | Aucune des sources lues ne mentionne les réflecteurs d'Apollo 14 et 15. À ajouter avec une source NASA dédiée si l'équipe le souhaite. |
| Les réflecteurs répondent « aujourd'hui encore » | Remplacée par « en 2004, 35 ans après, il fonctionnait toujours parfaitement » | Les sources JPL datent de 1999 et 2004. **Trouver une source NASA récente** avant de réécrire « aujourd'hui ». |
| « C'est la seule fois où des humains sont allés retrouver une machine abandonnée sur un autre monde » | **Retirée** | Aucune source consultée ne l'affirme. |
| Le vent « leur offre des années de vie en plus » | Réduite à « le vent a parfois nettoyé leurs panneaux » | Le nettoyage est documenté, mais aucune source lue ne le relie explicitement à la durée de vie. |
| Spirit roule « jusqu'à s'enliser dans un sol meuble » | Conservée et datée (2009) | NSSDCA 2003-027A |
| Voler sur Mars « ressemble à voler très haut au-dessus de l'Everest » | Remplacée par « l'atmosphère de Mars est moins de 1 % aussi dense que celle de la Terre » | La comparaison avec l'Everest n'est dans aucune source lue. |
| Relais Sojourner → Spirit et Opportunity (« un petit rover pouvait rouler ») | Documenté **uniquement** par la technologie d'atterrissage par airbags | JPL (2002) l'affirme explicitement ; le lien « petit rover → grands rovers » ne l'est pas. |
| Relais Spirit et Opportunity → grands rovers suivants | Documenté vers **Curiosity et Mars 2020** | Citation du chef de projet dans le communiqué JPL (2019). |

## 4. Divergences entre sources NASA

| Sujet | NSSDCA | NASA Science | Choix |
|---|---|---|---|
| Atterrissage d'Apollo 12 | 19 nov. 1969, 06:54 UT | 18 nov. 1969 (heure des États-Unis) | **UT (NSSDCA)**, cohérent avec les autres dates |
| Visite de Surveyor 3 | 2ᵉ sortie, 20 nov. (UT) | 19 nov. (heure des États-Unis) | Le récit dit « lors de leur deuxième sortie », sans date |
| Atterrissage de Spirit | 4 janv. 2004 (UT) | 3 janv. 2004 | UT, avec une note |
| Atterrissage d'Opportunity | 25 janv. 2004 (UT) | 24 janv. 2004 | UT, avec une note |
| Position de Surveyor 3 | 3,0162 S, 336,582 E | 3 S, 23,41 W | NSSDCA (images LRO), convertie en −23,418° |

## 5. Points de vigilance avant de passer en `reviewed`

1. **Statut du réflecteur d'Apollo 11** : `operational` repose sur une source de 2004. Il faut une source NASA récente, sinon passer à `unknown`.
2. **Coordonnées** : Spirit et Opportunity sont placés à leur **site d'atterrissage**, et non à leur position finale. Pas de coordonnées pour le LRRR, Sojourner et Ingenuity, car aucune n'est publiée dans les sources lues.
3. **Crédits** : 30 médias n'affichent aucun crédit sur leur page source. Ils restent à `null` et doivent être complétés depuis le Photojournal ou NASA Images avant publication.
4. **Vidéos** : les titres des 5 vidéos YouTube n'ont pas pu être récupérés. Ils sont à renseigner à la main.
5. **Médias du fil chronologique d'Ingenuity** : la légende indique l'entrée de la chronologie associée sur la page NASA, et non une légende officielle de l'image.
6. **Source de presse** : la phrase « my battery is low… » s'appuie sur ABC7. Il est préférable de remplacer cette source par le reportage d'origine (LAist) s'il devient accessible.

## 6. Médias de la NASA Image and Video Library (ajout du 2026-11-14)

Recherche faite avec l'API publique `images-api.nasa.gov`, sur 12 requêtes ciblées (Apollo 11 retroreflector et EASEP, Apollo 11 LM, Surveyor 3, Apollo 12 Surveyor, ALSEP et LM, Mars Pathfinder Sojourner, Mars Exploration Rover, Spirit, Opportunity, Ingenuity). Les URL exactes des fichiers viennent du manifeste officiel `/asset/{nasa_id}` de chaque média. **Aucun fichier n'est téléchargé.**

| | Avant | Ajoutés | Total |
|---|---|---|---|
| Images | 42 | 122 | 164 |
| Vidéos | 5 | 25 | 30 |
| Animations, modèles 3D, PDF | 9 | 0 | 9 |
| **Total** | **56** | **147** | **203** |

Par mission (un média peut concerner plusieurs missions) : Apollo 11 : 16 · Apollo 12 : 19 · Surveyor 3 : 8 · Mars Pathfinder : 28 · Spirit et Opportunity : 62 · Ingenuity : 82.

**Règles de sélection**
- **Lune** : choix manuel, une image après l'autre (EASEP et réflecteur, module lunaire, visite de Surveyor 3, déploiement de l'ALSEP, sismogramme de l'impact de l'étage de remontée d'Apollo 12). Les cérémonies de 2014, les lancements, les récupérations et les vues de la Terre sont exclus.
- **Mars (images)** : sélection automatique, puis relecture des titres. Pathfinder : images de 1996 à 1999 qui citent Pathfinder ou Sojourner, 20 au maximum. Spirit et Opportunity : 20 au maximum par rover, en excluant les autres missions. Ingenuity : 30 au maximum, avec « Ingenuity » ou « Mars Helicopter » dans le titre. Correction manuelle : les images de « Spirit Point » et de « Spirit Mound » sont des photos d'**Opportunity**.
- **Vidéos** : choix manuel. 1 vidéo Spirit et 24 vidéos Ingenuity (vols, tests, bilans, dernière transmission de données). Les vidéos hors sujet (Perseverance seul, bande-annonce de podcast) sont exclues. La bibliothèque ne contient aucune vidéo pertinente pour la Lune.

**À savoir avant publication**
- **Textes alternatifs en français** : générés sur le modèle « Image de la NASA (mission) : « titre anglais » ». Ils sont à traduire ou à réécrire.
- **Légendes** : recopiées depuis la description NASA et **raccourcies à environ 700 caractères** (48 médias, marqués par `[…]`). Le texte complet est sur `pageUrl`.
- **Crédits** : repris des métadonnées (`photographer`, `secondary_creator` ou mention « credit » dans la description). Sinon, la provenance est indiquée (« NASA (Image and Video Library, centre) »). Une coquille de la NASA est conservée telle quelle : « NASA/JPCaltech » (PIA05032).
- **Images non photographiques** : certaines sont des **vues d'artiste, des illustrations ou des simulations**, et leur titre l'indique (« Artist's Concept », « Illustration », « Simulated »). Le frontend doit les signaler pour ne pas les confondre avec des photos.
- Nouveaux champs facultatifs de `Media` : `thumbnailUrl`, `nasaId`, `dateCreated`.
- **Liens vérifiés** le 2026-11-14 : 294 URL (fichiers et miniatures) répondent, en ne lisant que le premier octet. Les apostrophes typographiques sont encodées dans les URL.

### 6.1 Mise à jour du 2026-11-14 — accessibilité, nature des médias, chronologies

- **Textes alternatifs** : les 147 médias de la bibliothèque ont maintenant de vrais textes alternatifs en **français et en anglais simples**, écrits à partir du titre et de la description NASA. Les titres illisibles (« PIA05044 », « Space Science », « KSC-… ») ont été remplacés par une description.
- **Médias retirés** (183 restants) : 19 images en relief anaglyphe (il faut des lunettes 3D) et PIA05287, dont les métadonnées NASA se contredisent (attribuée à Spirit, mais décrit le sol de Meridiani, le site d'Opportunity).
- **Champ `depiction`** sur chaque média : 131 photos, 12 schémas ou cartes, 6 vues d'artiste, 7 simulations, 25 « mixtes » (vidéos montées, non vérifiées image par image, et une image moitié photo moitié dessin : PIA23553), 2 documents. Le frontend **doit** afficher un badge (PRD MEDIA-001, CLAUDE.md §6). Les GIF fabriqués à partir de vraies images de caméra comptent comme `photo` (ex. PIA25321, d'après sa description NASA).
- **Crédit erroné retiré** : « NASA/JPCaltech » (PIA05032), une coquille des métadonnées NASA, est remplacé par la provenance « NASA (Image and Video Library, JPL) ».
- **Chronologies** (TIMELINE-001) : 50 étapes sur 6 missions, chacune avec une date sourcée, un titre et une explication simple en fr/en. 43 ont au moins une image. Formulations retirées faute de source : « de la taille d'un four à micro-ondes » (Sojourner), « plus de mille commandes » (fin d'Opportunity), « nuits glaciales » (Ingenuity), « en l'honneur de son jumeau » (Spirit Point).
- **Récits réécrits en langage simple** : mots techniques expliqués au passage (sismomètre, prisme en coin de cube, photon, hématite, rover, rotors…). Les faits et les sources sont inchangés et **chacune des 6 étapes de chaque récit a au moins une image**.
- Étapes de chronologie **sans image** (aucune image fiable trouvée) : lancements de Surveyor 3, d'Apollo 11 et 12 et d'Opportunity, dernier contact de Surveyor 3, silice de Spirit, dernier message de Spirit.

## 7. Fiche de relecture (à remplir par le relecteur)

| Récit | Relu par | Date | Faits vérifiés OK / KO | Verdict |
|---|---|---|---|---|
| moon-apollo11-retroreflectors | | | | |
| moon-surveyor-apollo12 | | | | |
| mars-spirit-opportunity | | | | |
| mars-ingenuity | | | | |
