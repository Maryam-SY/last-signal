# US-5.14 — Chaque machine raconte sa vie à sa façon (actes + direction artistique « Transmission »)

- **Statut** : review
- **Epic** : E5 — Transparence, qualité et publication
- **Priorité** : P0 (décision de l'équipe du 2026-11-15)
- **Exigences PRD** : EQUIP-002, STORY-007 (trois voix : « À ton tour » conservé), MEDIA-001, NFR-A11Y-006
- **Décisions liées** : ADR-025 (nouvelle), ADR-023, ADR-024
- **Branche** : `main` (poussée directement à la demande de l'équipe le 2026-11-15)

## Demande de l'équipe (2026-11-15)

« Pourquoi 6 étapes pour expliquer une machine ? Il ne faut pas se limiter à 6 étapes… Chaque machine a sa propre histoire, donc sa propre manière de la raconter. Choque-moi. » Et, plus tôt : « améliore l'immersivité… toute notre direction artistique ».

## Ce qui change

### Les actes (`frontend/src/lib/acts.ts`, `components/machine/ActCard.tsx`)

La structure du récit d'une machine n'est plus un gabarit : elle est **calculée depuis ses dates sourcées** (arrivée, durée prévue, dernier signal, fin déclarée, « fonctionne encore »).

| Acte | Quand | Chiffre mis en scène |
|---|---|---|
| Départ | chapitres avant l'arrivée | — |
| Mission prévue | arrivée → arrivée + durée prévue | la durée annoncée (« 90 jours martiens prévus ») |
| Prolongations | → dernier signal | le ratio (« ×57 »), « Jour 91 : fin prévue de la mission. Elle continue. » |
| Silence | dernier signal → fin déclarée | les jours sans réponse (Opportunity : 248) |
| Après | au-delà | — |
| Répond encore | machine en service (LRRR) | depuis {année} |
| Sa mission | sans durée prévue connue (Surveyor 3) | — |

Les actes « plan », « prolongations » et « silence » existent même sans chapitre (carte-titre seule). Les chapitres sans date suivent le précédent. Exemples obtenus : Opportunity 5 actes (Départ, Mission prévue, Prolongations ×57, Silence 248 jours, Après) ; Ingenuity : plan en vols (pas de borne par date) → Départ, Sa mission, Silence, Après ; LRRR : Départ, Répond encore ; EASEP : Départ, Mission prévue, …

### Ouverture à froid et télémétrie

La page commence par la fin : « Dernier signal reçu le 10 juin 2018 » se décode (`DecodeText`), puis le nom. Ligne `TelemetryBar` : voyant d'état **+ libellé**, barres de signal, id NSSDCA, lieu, coordonnées sourcées (format « 1,95° S · 5,53° O »).

### Direction artistique « Transmission »

Grain + vignette (`CinemaLayer`), anneau de curseur (souris seulement), coins HUD, balayage de scan sur la photo d'arrivée, id NASA sur la photo au premier plan du vol, en-tête « dossier » des cartes du hangar, chargement « Acquisition du signal », séquence du dernier signal (trace → ligne plate → date tapée → épilogue ; crépitement radio si le son est activé). Détails et règles : DESIGN_SYSTEM §4, ADR-025.

### Retiré des pages machine

Le récit en 6 étapes (`StorySlides`). Routes `/stories/:id`, composants et contenus **conservés** (CLAUDE.md §6) ; décision de retrait à prendre par l'équipe (PRD §2, STORY-003/005, règle V6, `USER_FLOWS`).

## Vérification

| Contrôle | Résultat réel |
|---|---|
| `lib/acts.test.ts` | 5/5 |
| Frontend `npm run check` | lint 0 erreur (avertissements préexistants), typecheck OK, 77/77, build OK |
| Backend | inchangé (59/59) |
| Navigateur (1440×900) | Opportunity : ouverture « Dernier signal reçu le 10 juin 2018 » puis nom décodé ; télémétrie (voyant + « Mission terminée », NSSDCA 2003-032A, Meridiani Planum, 1,95° S · 5,53° O) ; actes Départ (1 moment), Mission prévue (5), Prolongations ×57 (38), Silence 248 jours (3) ; grain et anneau de curseur présents ; hangar Lune : en-tête dossier « 01 / 06 · 1967-035A » + voyant + barres |
| Navigateur (375×812) | Opportunity : aucune largeur > 375 px ; héros, carte « Prolongations » et ligne de vie lisibles |
| Non vérifié | son (crépitement du dernier signal), curseur en mouvement, séquence du dernier signal en animation (panneau masqué pendant une partie des tests) |

## À valider par un humain

- Retirer ou garder les pages `/stories/:id` (et la règle V6) ; mettre à jour PRD §2 / STORY-003 / STORY-005 / USER_FLOWS.
- La couleur verte `#4ade80` (voyant « fonctionne », acte « répond encore ») n'est pas dans la palette COSMOS (OPEN-01/13).
- Les titres des actes et la phrase « Tout le reste est un cadeau » (ton éditorial).

## Suite — audits et corrections (2026-11-15)

Trois audits (performance/code, accessibilité/mobile/UX, contenu/i18n/docs) ont été menés sur le dépôt ; rapports de travail hors dépôt. Corrigé dans la foulée :

- **Performance** : images NASA servies en variante `~large` / `~medium` au lieu des originaux (`lib/mediaSrc.ts`, jusqu'à 5 000 px avant) ; en-tête `Cache-Control` sur l'API (`public, max-age=300, stale-while-revalidate=86400`) ; pages chargées à la demande (`app/lazyPages.ts`, seule l'accueil dans le premier paquet) ; un seul fichier de ciel (le panorama sert aussi d'image CSS) ; textures 4k réservées à la planète de la page destination (`hd`) ; photos lointaines du vol démontées (mémoire) et écritures par image évitées quand rien ne change ; graphe audio suspendu quand le son est coupé ; minuteur de l'intro nettoyé.
- **Accessibilité / mobile** : scènes invisibles de l'accueil `inert` ; plus de flèches flottantes sur téléphone ; badge MEDIA-001 lu dans le panneau du vol sur téléphone ; `/explore/:world/:inconnue` et `/explore/:inconnue` → page « introuvable » (plus « signal perdu ») ; attribut `lang` du contenu (interface wolof, récits en français) ; libellés des boutons désactivés du rail ; légende vidéo au-dessus des commandes sur petit écran ; indicateur « Acquisition du signal » sur le modèle 3D ; liens des sources et crédits à 44 px ; sommaire sur À propos ; étiquettes mono 11,5 px ; registre « tu » et formulations sans pronom (« Portrait », « Ce qui a été transmis », « Répond encore ») ; « Schéma / carte ».
- **Contenu** (validation 0 erreur) : note interne retirée de l'épilogue du réflecteur laser ; attributions de source retirées de 5 textes affichés ; photo Apollo 12 retirée de l'étape 1967 de Surveyor 3 ; « pas une photo » dans l'alt de deux images de synthèse. Journal : `docs/content/CONTENT_REVIEW.md`.
- **Docs** : CLAUDE.md (`backend/content/`, parcours), index des ADR (022–025), DATA_MODEL (V1–V18), commentaire de `validate.ts`.
- **Non fait, à décider** (voir message de synthèse) : compression HTTP (dépendance ou hébergement, OPEN-05), suppression de ~1 570 lignes de code mort et de 55 clés i18n liées, 83 médias orphelins, forme allégée des réponses API, SpaceScene ralenti sur les pages de lecture, refonte des docs produit (USER_FLOWS, ARCHITECTURE, SCOPE, PRD §2 / STORY-003/005 / V6), OPEN-07 (compteurs affichés à l'accueil).

## Suite 2 — retours du 2026-11-15 (soir)

- **Photos disparues** : cause trouvée — les variantes `~large.jpg` devinées n'existent que pour 117 des 252 images de la bibliothèque NASA (403 sinon). Correctif : plus aucune URL devinée ; un champ `media.largeUrl` **vérifié** (HEAD 200, 48 images) est servi quand il existe, sinon l'original ; `<img>` retente l'original si une copie échoue. Contrôle navigateur : 0 image cassée sur la page Opportunity.
- **Aucune image deux fois** : les photos déjà montrées (photo d'arrivée, portrait, chapitre précédent) sont retirées des chapitres suivants et des cartes « Pour nous, sur Terre » ; un moment garde son texte même sans photo. 38 chapitres se retrouvent sans photo propre → recherche NASA en cours pour les compléter.
- **Vol de photos** : le panneau de texte change de côté avec la photo (mur gauche ↔ texte à droite) et s'incline vers elle (rotateY ±12°, translateZ), l'ombre suit ; rien sous `prefers-reduced-motion`.
- **Fin de l'intro** : carte-titre « AeroReborn présente » / « The Next Frontier » lettre à lettre, ligne lumineuse ; durée 3,8 s.
- **Compression HTTP** : middleware Brotli/gzip sur `/api` à partir de `node:zlib` (aucune dépendance), seuil 1 ko ; test API ajouté.
- **Code mort supprimé** (35 fichiers, 2 dépendances `@base-ui/react` et `class-variance-authority`) : carte, galerie, scène mission, frise des deux mondes, journal d'explorateur affiché, bouton shadcn, `StorySlides`, planètes décoratives et leurs images, anciens médias d'intro/ciel ; liste dans ARCHITECTURE §18. Vérification : typecheck, lint, 78 tests, build.

## Suite 3 — « l'envie de rester pour apprendre » (2026-11-15)

- **Accroche par machine** dans le hangar (`lib/hook.ts`) : « Répond encore, depuis 1969 », « A vécu 57 fois plus longtemps que prévu », « A travaillé 85 jours, puis s'est tu » — calculé depuis la durée de vie sourcée.
- **Mots à connaître** sous chaque acte (glossaire US-5.7 réutilisé, `wordsIn` sur les textes des chapitres).
- **Quiz « Qu'as-tu retenu ? »** (`lib/quiz.ts`, `MachineQuiz`) : jusqu'à 3 questions construites uniquement depuis les faits sourcés (année d'arrivée, durée prévue, type, statut) ; les mauvaises réponses sont des années/quantités/types volontairement faux ; chaque réponse donne le fait ; rien n'est stocké ni envoyé. Tests : `lib/pedagogy.test.ts`, `api-pages.test.tsx`.
- **Relations cliquables** : chaque bout d'une relation mène à la page de la machine ou au hangar de son monde.
- **Visionneuse** (`Lightbox`, `<dialog>` natif) : clic sur le texte d'un moment ou sur la loupe → la photo en grand avec sa description et son badge ; clic à côté, bouton ou Échap pour fermer.
- **Vol de photos sans zoom continu** (demande de l'équipe) : le défilement choisit seulement quel moment est devant ; la photo arrive à taille fixe depuis son côté, inclinée vers le texte, et repart de même (transition 780 ms) ; texte qui glisse depuis le côté opposé ; un cran de molette ou un geste = un moment (`scroll-snap` partout) ; photos plus grandes (jusqu'à 46 vw / 820 px).
- **Intro** : plus de bouton « Activer le son » — la bande-son démarre si le navigateur l'autorise, sinon au premier geste (clic, touche, toucher) ; une voix de synthèse lit chaque phrase à l'écran (aucune voix de personne réelle : la demande d'imiter une célébrité est refusée). Son d'ambiance activé par défaut (désactivable, choix mémorisé).
- Contrôles : frontend 83/83, lint 0 erreur, build OK ; navigateur : pas d'étape vide, photo devant à ~700 px, visionneuse ouverte par clic sur le texte et fermée par le fond.
- En cours : photos NASA pour 38 chapitres ; explications simples entre parenthèses des mots techniques (relecture en cours).

- **Plus aucune mention « en cours de vérification » sur le site** (décision de l'équipe) : retirés — l'encart des récits en brouillon, la ligne sous les mots à connaître, la note wolof du pied de page, le texte « sera complétée avant la mise en ligne » de la section IA d'À propos (remplacé par une description factuelle de l'usage de l'IA). Les statuts `draft` restent dans le contenu et les avertissements de `content:check` pour la relecture interne.

## Suite 4 — photos manquantes et photos qui ne s'affichaient pas (2026-11-15)

- **Affichage** : chaque cadre du vol montre immédiatement la vignette NASA (floutée), la grande image se fond par-dessus ; décodage 3 images à la fois, 6 moments d'avance, 1 200 px max. Contrôle : 44/44 vignettes chargées sur Opportunity, 0 cassée.
- **Photos manquantes** : recherche NASA sur les 38 moments sans photo propre → 44 nouvelles images vérifiées (HTTP 200, variantes existantes stockées dans `largeUrl`) ajoutées à 31 chapitres ; écartée : PIA26717 (antenne photographiée en 2025 pour un moment de 1998). Il reste **7 moments sans image propre** (Surveyor 3 « la nuit tombe », LRRR « toujours en service », ALSEP « bandes retrouvées », Pathfinder « construit et emballé », « lancement », « au revoir », Sojourner « un nom célèbre ») : aucune image NASA indexée ou déjà utilisée plus haut.
- **Origine vérifiée** : 11 images servies depuis apollojournals.org = Apollo Lunar Surface Journal (Eric Jones, publié en 1995, longtemps hébergé par la NASA History à hq.nasa.gov/alsj) ; les anciennes adresses nasa.gov renvoient aujourd'hui vers la page NASA « The Apollo Lunar Surface Journal and Apollo Flight Journal », qui envoie vers apollojournals.org (« Visit the Apollo Journals Website »). Aucune de ces images n'est dans la NASA Image and Video Library. À valider par un humain ; deux schémas/graphes utilisés comme illustrations (badge « Schéma / carte ») ; la photo du laser de Goddard vise LRO (dit dans la légende) ; `surveyor.jpg` montre un Surveyor sur Terre, pas spécifiquement le n° 3 ; images 1997 de petite taille.

## Suite 5 — mots compliqués expliqués entre parenthèses (2026-11-15)

- Demande de l'équipe : « on s'adresse à des jeunes, évite les termes compliqués ; mets l'explication entre parenthèses ».
- 37 termes relevés sur les 1 624 textes affichés (sismomètre, prisme en coin de cube, générateur nucléaire, spectromètre, vent solaire, hématite, gypse, silice, sulfate, basalte, sol martien, bouclier thermique, rotor, delta, microbe, géologue, rayonnements, relativité générale, manteau…) ; **143 insertions**, à la première apparition du terme dans chaque machine/mission/récit et par langue, jamais dans un titre ; aucune quand le texte expliquait déjà le mot. Chaque explication tient en une ligne et s'appuie sur une page NASA / NSSDCA / USGS citée (31 nouvelles entrées dans `glossary.json`, `draft`, avec leurs sources ; « bedrock » non ajouté au glossaire faute de forme française).
- Laissés tels quels (jugés connus à 12 ans ou déjà expliqués) : cratère, orbite, atmosphère, météorite, airbag, panneau solaire, dioxyde de carbone, argile… ; « UT/UTC » (heures) et quelques unités (newtons, nanomètres) restent sans explication — à décider.
- Vérification : `content:check` 0 erreur, backend 60/60. Phrases denses à relire : description de l'ALSEP (trois parenthèses), résumé d'Opportunity (deux).
- Phrases allégées (choix de l'équipe délégué) : ALSEP — la liste des six instruments devient « l'un sentait le sol trembler (un sismomètre), un autre mesurait le magnétisme (un magnétomètre)… » ; Opportunity — « de petites billes grises d'hématite, surnommées « myrtilles », et des veines de gypse : deux minéraux qui se forment en général dans l'eau ».
- **UT et unités** (accord de l'équipe) : « UT (temps universel) » ajouté aux Mots à connaître (définition : heure de référence mondiale, celle de Greenwich ; une date en UT peut différer d'un jour ailleurs — source NASA Goddard) ; parenthèses à la première apparition : newtons (« de quoi soulever environ 4,6 tonnes sur Terre », 45 000 ÷ 9,8 — sources NASA Science et NASA Glenn), nanomètre (« trois dixièmes de milliardième de mètre » — NASA Astrobiology), gammas (« une unité de champ magnétique ; à la surface de la Terre, le champ en mesure environ 25 000 à 65 000 » — NASA Goddard et NOAA NCEI). Glossaire : 45 entrées.
- **Correctif** : le mot « sol » (jour martien) était reconnu dans « le sol » (la surface) et sa définition s'affichait sur des pages lunaires ; ses formes françaises sont limitées à « sol(s) martien(s) » / « jour(s) martien(s) ». Vérifié sur la page du module lunaire d'Apollo 11.


## Suite 6 — son spatial, intro sans voix, site plus léger (2026-11-15, après déploiement)

- **Voix off de l'intro retirée** (décision de l'équipe : le rendu voulu n'est pas atteignable) : plus de voix de synthèse ni de module d'enregistrements (`lib/introVoice` supprimé, option `deep` de `narration.ts` retirée).
- **Son « espace »** : plus aucun effet de bruit filtré (le « chut »). `lib/spaceAudio.ts` : sons purs envoyés dans un long écho sombre (réverbération de synthèse). Intro : montée grave au décollage, accord ouvert et scintillements sur la Lune, accord qui glisse vers le bas pour Mars, nappe grave, éclosion sous le titre. Son d'ambiance : nappe grave qui respire + scintillements lointains (le souffle permanent est retiré). Entre les pages, un glissement de deux sons vers l'aigu remplace le « whoosh » ; le dernier signal d'une machine : deux « pings » qui s'éteignent dans l'écho, au lieu du grésillement radio.
- **Son de l'intro qui ne démarrait pas** : sur téléphone, le toucher était écouté au mauvais moment (`touchstart` et le `pointerdown` d'un doigt ne débloquent pas le son) ; écoute aussi de `pointerup`, `touchend` et `click`. Quand le navigateur bloque le son, un bouton « Activer le son » s'affiche à gauche de « Passer l'intro ». Test : `IntroVideo.test.tsx`.
- **Lenteurs** : vidéo d'intro réencodée en 720p (6,2 Mo → 1,8 Mo, même image) ; `/media/*` gardé un jour par le CDN Vercel. Vol de photos : les miniatures ne sont chargées qu'autour de la photo affichée (au lieu des 48 d'un coup) ; sur téléphone, les images de la disposition « ordinateur » (masquée en CSS mais téléchargée quand même) ne sont plus chargées, et inversement ; 4 grandes photos préparées d'avance (2 si la connexion est lente ou en mode économie de données). Mesure sur la page d'Opportunity en largeur téléphone : 25 requêtes d'images en ligne avant, 7 en local après (défilements comparables mais non identiques).
- **Correctif** : clés React en double (`launch`, `landing`) dans la frise d'un monde (Spirit et Opportunity ont tous deux un lancement et un atterrissage en 2003) ; clé = mission + événement.
- Vérification : frontend lint ✓, typecheck ✓, 84/84 tests, build ✓ ; essai dans le navigateur (intro sans voix, vol de photos en largeur téléphone et ordinateur, frise de Mars sans avertissement).

## Suite 7 — vol de photos « comme TikTok » sur téléphone (2026-11-15)

- Téléphones et tablettes : un moment = un écran (le moment *i* est exactement *i* écrans plus bas ; la suite de la page un écran après le dernier). Pendant que le vol occupe l'écran, la page s'arrête obligatoirement sur chaque moment (`html[data-flight-snap]` : `scroll-snap-type: y mandatory`, `scroll-snap-stop: always`) : un geste = un moment, même un grand geste ; un arrêt juste avant et juste après le vol permet d'en sortir dans les deux sens. Ailleurs, la page défile librement. Grands écrans : inchangé.
- Le moment affiché est calculé sur la hauteur du vol lui-même (et non `innerHeight`), pour que la barre d'outils mobile de Safari (100vh ≠ innerHeight) ne décale pas le compte.
- Vérifié dans le navigateur (vue téléphone 375 × 812) : entrée → moments 1, 2, 3 → sortie, puis retour 3, 2, 1 → sortie par le haut ; vol de 38 moments : un geste de 250 px comme de 900 px avance d'un seul moment.

## Suite 8 — iPhone : « Un problème s'est produit de façon répétée » (2026-11-15)

- Symptôme (iPhone, dernière version d'iOS, Safari) : Safari fermait l'accueil (message système « un problème s'est produit de façon répétée »), Android correct. Cause la plus probable : la mémoire — l'accueil créait 5 scènes WebGL à la fois (ciel + 4 globes, chacun avec sa carte 2048 × 1024, l'antialiasing et un halo flouté), qu'iOS refuse au-delà d'une certaine quantité. Non reproduit sur un vrai iPhone (WebKit de test non téléchargeable depuis le poste).
- Mode léger sur téléphone (`lib/device.ts`, écran tactile ou fenêtre < 1024 px) : cartes réduites à 1024 px avant d'aller au GPU (4× moins de mémoire), pas d'antialiasing, résolution des globes ≤ 1,5×, sphères moins détaillées, ciel en 1× ; un globe n'existe que pendant qu'il est vu et il est libéré 1,5 s après être sorti de l'écran (la photo de la planète le remplace ; un nouveau `<canvas>` à chaque retour, car un contexte WebGL libéré reste perdu). Halo des globes sans filtre de flou (dégradé plus large), grain de film immobile et à la taille de l'écran.
- Mesure en vue téléphone : au plus 2 globes vivants à la fois sur l'accueil (contre 4), recréés en remontant. Grands écrans inchangés.
- Correctif associé (déjà en ligne, 104ca76) : plus de lookbehind dans les expressions régulières (pages machine sur iOS < 16.4).
- **Suite (même jour)** : le site s'ouvrait sur iPhone mais Safari le refermait au bout de quelques secondes. Sur iPhone et iPad (`appleTouchDevice()`), plus aucune scène WebGL : ciel en photo fixe avec étoiles CSS, planètes photographiées qui tournent toujours (Android et ordinateurs gardent la 3D). Téléphones : les photos de fond du vol passent elles aussi par la réduction à 1200 px (certains originaux NASA font 5000 px, environ 70 Mo une fois décodés ; 3 à la fois), avec la petite copie affichée tout de suite. Test : `lib/device.test.ts`. Frontend : 86/86 tests, build OK.
- **Suite 2 (même jour)** : ça sautait encore. Cause trouvée par mesure : sur l'accueil, le voyage en profondeur gardait prêts des calques agrandis par la perspective — un bloc planète tiré à 118 fois la surface de l'écran, un halo flouté (64 px) à 91 écrans, des scènes invisibles (opacité 0) à 100 écrans chacune ; environ 470 écrans de calques, qu'iOS garde en mémoire à leur taille dessinée. Correctifs : une scène que la caméra ne voit pas est masquée (`visibility: hidden`) ; sur téléphone, une scène qui passe la caméra est agrandie au plus ×2 (au lieu de ×10) ; halo des planètes photographiées sans flou (dégradé) ; petites copies des photos de fond sans flou. Mesure en vue téléphone : 9 écrans au plus sur l'accueil, 8 sur une planète, moins de 1 sur une page machine.

## Suite 9 — swipe plus vif, fins de section, logo, référencement (2026-11-15)

- **Swipe « lent »** : sur téléphone, l'image et le texte restaient épinglés pendant que la page défilait dessous ; le moment suivant n'apparaissait qu'une fois le défilement fini, puis en fondu de 0,7 s. Remplacé par un vrai fil (`PhoneFeed`) : chaque moment est une diapositive plein écran qui suit le doigt, arrêt obligatoire sur chacune tant que le fil occupe l'écran, arrêt avant et après pour en sortir. Le couloir 3D reste pour les grands écrans (ses parties « téléphone » retirées).
- **Fins de section trop transparentes** : l'animation `scene-blend` assombrissait toute la section à 25 % pendant qu'elle quittait l'écran, alors que ses derniers éléments étaient encore lus. Elle ne joue plus qu'à l'arrivée (fondu d'entrée), la section reste opaque ensuite.
- **Logo** : voir DESIGN_SYSTEM §6 (atterrisseur en A qui émet son signal) ; favicons, icônes iPhone/Android, manifeste.
- **Référencement de base** : titre et description du site, adresse canonique, couleur de thème, aperçu de partage (Open Graph + Twitter, image 1200 × 630), données structurées `WebSite`, `robots.txt` (API exclue), `sitemap.xml` (15 pages, régénéré à partir du contenu par `scripts/sitemap.mjs` avant chaque build : une machine ajoutée y apparaît d'elle-même ; `icons.svg`, reste du modèle Vite, supprimé). Chaque page met à jour son titre, sa description (texte de la machine ou du monde) et son adresse canonique ; les aperçus des messageries lisent `index.html` (aperçu commun au site).

## Suite 10 — en-tête et pied de page retravaillés (2026-11-15)

- **En-tête** (`components/navigation/SiteHeader.tsx`) : logo et nom (la ligne « Lune · Mars » sous le nom retirée à la demande de l’équipe), liens directs **Lune**, **Mars**, **À propos et sources** (soulignement cyan sur la page courante), son et langue regroupés ; barre givrée une fois la page défilée et **ligne de signal** qui se remplit avec la lecture ; sur les pages de lecture, il s'efface en descendant et revient en remontant (jamais s'il a le focus ; toujours visible sur l'accueil). Téléphone : bouton **Menu** → panneau plein écran (`<dialog>` modal : focus gardé, Échap ferme, retour du focus au bouton) avec grands liens, son, langue et mention d'indépendance ; il se ferme quand on suit un lien. Le lien « Explorer » est remplacé par Lune / Mars (le logo mène à l'accueil). `SiteNavigation.tsx` remplacé et supprimé.
- **Pied de page** (`components/navigation/SiteFooter.tsx`) : logo, devise du site et note sur les sources ; colonnes **Explorer** (le voyage, Lune, Mars) et **Le projet** (à propos, sources, crédits des images, IA) ; mention d'indépendance et **Haut de page** ; grand « AeroReborn » pâle en fond (décoratif). Placé au-dessus du rail de progression.
- `LogoMark` déplacé dans `components/brand/LogoMark.tsx` (partagé). Tests `routes.test.tsx` adaptés à la nouvelle navigation (Lune et Mars non courantes sur /about).
- Vérifié à 360, 375 et 1100 px : pas de débordement horizontal, menu ouvert/fermé (lien, bouton, Échap).
